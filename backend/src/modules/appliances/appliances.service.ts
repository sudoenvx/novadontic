import type { Prisma, PrismaClient } from '../../generated/prisma/client.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import type {
  ApplianceField,
  ApplianceFieldGroup,
  ApplianceFieldGroupInput,
  ApplianceFieldGroupUpdateInput,
  ApplianceFieldInput,
  ApplianceFieldOption,
  ApplianceFieldType,
  ApplianceFieldUpdateInput,
  ApplianceType,
  ApplianceTypeInput,
  ApplianceTypeListInput,
  ApplianceTypeListResult,
  ApplianceTypeUpdateInput,
  AppliancesServiceContract,
} from './appliances.domain.ts';

const applianceTypeInclude = {
  fieldGroups: {
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: {
      fields: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
    },
  },
} satisfies Prisma.ApplianceTypeInclude;

type ApplianceTypeRow = Prisma.ApplianceTypeGetPayload<{
  include: typeof applianceTypeInclude;
}>;
type ApplianceGroupRow = Prisma.ApplianceTypeFieldGroupGetPayload<{
  include: { fields: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] } };
}>;
type ApplianceFieldRow = Prisma.ApplianceTypeFieldGetPayload<object>;
const applianceFieldTypes: readonly ApplianceFieldType[] = [
  'text',
  'number',
  'select',
  'multiselect',
  'textarea',
  'date',
  'checkbox',
  'file',
  'image',
];
const platformDefaultApplianceCodes = new Set(['aligner', 'retainer']);

function toOptions(value: Prisma.JsonValue | null): ApplianceFieldOption[] {
  if (value === null) return [];
  if (!Array.isArray(value)) {
    throw new Error('Stored appliance field options must be a JSON array.');
  }

  return value.map((option) => {
    if (
      typeof option !== 'object' ||
      option === null ||
      Array.isArray(option) ||
      !('label' in option) ||
      !('value' in option) ||
      typeof option['label'] !== 'string' ||
      typeof option['value'] !== 'string'
    ) {
      throw new Error('Stored appliance field option has an invalid shape.');
    }
    return { label: option['label'], value: option['value'] };
  });
}

function toField(row: ApplianceFieldRow): ApplianceField {
  const type = applianceFieldTypes.find((fieldType) => fieldType === row.dataType);
  if (!type) {
    throw new Error(`Stored appliance field type "${row.dataType}" is not supported.`);
  }
  return {
    id: row.id.toString(),
    groupId: row.groupId?.toString() ?? null,
    key: row.fieldKey,
    label: row.label,
    type,
    options: toOptions(row.selectOptions),
    defaultValue: row.defaultValue,
    dependsOn: row.dependsOn,
    dependsOnValue: row.dependsOnValue,
    required: row.isRequired,
    sortOrder: row.sortOrder,
    helpText: row.helpText,
  };
}

function toGroup(row: ApplianceGroupRow): ApplianceFieldGroup {
  return {
    id: row.id.toString(),
    name: row.name,
    sortOrder: row.sortOrder,
    fields: row.fields.map(toField),
  };
}

function toApplianceType(row: ApplianceTypeRow): ApplianceType {
  return {
    id: row.id.toString(),
    code: row.code,
    name: row.name,
    source: platformDefaultApplianceCodes.has(row.code) ? 'Platform default' : 'Custom type',
    color: row.color,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    fieldGroups: row.fieldGroups.map(toGroup),
  };
}

function notFound(resource: string): AppError {
  return new AppError(`${resource} was not found`, 404, `${resource.toUpperCase().replaceAll(' ', '_')}_NOT_FOUND`);
}

function isPrismaError(error: unknown, code: string): boolean {
  return error instanceof Error && 'code' in error && error.code === code;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'appliance';
}

async function nextAvailableCode(prisma: PrismaClient, name: string): Promise<string> {
  const baseCode = slugify(name);
  for (let suffix = 1; suffix <= 1_000; suffix += 1) {
    const suffixText = suffix === 1 ? '' : `-${suffix}`;
    const code = `${baseCode.slice(0, 30 - suffixText.length)}${suffixText}`;
    const existing = await prisma.applianceType.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new AppError('Could not generate a unique appliance type code', 409, 'APPLIANCE_TYPE_CODE_LIMIT_REACHED');
}

function nextSortOrder(current: number | undefined): number {
  const next = (current ?? -1) + 1;
  if (next > 32_767) {
    throw new AppError('The maximum sort order has been reached', 409, 'SORT_ORDER_LIMIT_REACHED');
  }
  return next;
}

export class AppliancesService implements AppliancesServiceContract {
  constructor(private readonly prisma: PrismaClient) {}

  async listTypes(input: ApplianceTypeListInput): Promise<ApplianceTypeListResult> {
    const filters: Prisma.ApplianceTypeWhereInput = {
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.search
        ? {
            OR: [
              { name: { contains: input.search } },
              { code: { contains: input.search } },
            ],
          }
        : {}),
    };
    const conditions: Prisma.ApplianceTypeWhereInput[] = [filters];
    if (input.cursor) {
      const cursorType = await this.prisma.applianceType.findUnique({
        where: { id: BigInt(input.cursor) },
        select: { id: true, sortOrder: true },
      });
      if (!cursorType) {
        throw new AppError('Appliance type cursor was not found', 422, 'INVALID_APPLIANCE_TYPE_CURSOR');
      }
      conditions.push({
        OR: [
          { sortOrder: { gt: cursorType.sortOrder } },
          { sortOrder: cursorType.sortOrder, id: { gt: cursorType.id } },
        ],
      });
    }
    const where: Prisma.ApplianceTypeWhereInput = { AND: conditions };
    const [rows, total] = await Promise.all([
      this.prisma.applianceType.findMany({
        where,
        include: applianceTypeInclude,
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        take: input.limit + 1,
      }),
      this.prisma.applianceType.count({ where: filters }),
    ]);
    const hasMore = rows.length > input.limit;
    const data = rows.slice(0, input.limit).map(toApplianceType);
    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id ?? null : null,
      total,
    };
  }

  async getTypeById(id: string): Promise<ApplianceType> {
    const row = await this.prisma.applianceType.findUnique({
      where: { id: BigInt(id) },
      include: applianceTypeInclude,
    });
    if (!row) throw notFound('Appliance type');
    return toApplianceType(row);
  }

  async getGroups(typeId: string): Promise<ApplianceFieldGroup[]> {
    const applianceTypeId = BigInt(typeId);
    const typeExists = await this.prisma.applianceType.findUnique({
      where: { id: applianceTypeId },
      select: { id: true },
    });
    if (!typeExists) throw notFound('Appliance type');
    const rows = await this.prisma.applianceTypeFieldGroup.findMany({
      where: { applianceTypeId },
      include: { fields: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] } },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    return rows.map(toGroup);
  }

  async createType(input: ApplianceTypeInput): Promise<ApplianceType> {
    try {
      const existingName = await this.prisma.applianceType.findFirst({
        where: { name: input.name },
        select: { id: true },
      });
      if (existingName) {
        throw new AppError('An appliance type with this name already exists', 409, 'APPLIANCE_TYPE_EXISTS');
      }
      const last = await this.prisma.applianceType.findFirst({
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      const code = await nextAvailableCode(this.prisma, input.name);
      const row = await this.prisma.applianceType.create({
        data: {
          code,
          name: input.name,
          ...(input.color !== undefined ? { color: input.color } : {}),
          sortOrder: input.sortOrder ?? nextSortOrder(last?.sortOrder),
        },
        include: applianceTypeInclude,
      });
      return toApplianceType(row);
    } catch (error) {
      if (isPrismaError(error, 'P2002')) {
        throw new AppError('An appliance type with this name or code already exists', 409, 'APPLIANCE_TYPE_EXISTS');
      }
      throw error;
    }
  }

  async updateType(id: string, input: ApplianceTypeUpdateInput): Promise<ApplianceType> {
    const applianceTypeId = BigInt(id);
    try {
      if (input.name !== undefined) {
        const duplicate = await this.prisma.applianceType.findFirst({
          where: { name: input.name, id: { not: applianceTypeId } },
          select: { id: true },
        });
        if (duplicate) {
          throw new AppError('An appliance type with this name already exists', 409, 'APPLIANCE_TYPE_EXISTS');
        }
      }
      const row = await this.prisma.applianceType.update({
        where: { id: applianceTypeId },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.color !== undefined ? { color: input.color } : {}),
          ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
        },
        include: applianceTypeInclude,
      });
      return toApplianceType(row);
    } catch (error) {
      if (isPrismaError(error, 'P2025')) throw notFound('Appliance type');
      if (isPrismaError(error, 'P2002')) {
        throw new AppError('An appliance type with this name already exists', 409, 'APPLIANCE_TYPE_EXISTS');
      }
      throw error;
    }
  }

  async setTypeActive(id: string, isActive: boolean): Promise<ApplianceType> {
    try {
      const row = await this.prisma.applianceType.update({
        where: { id: BigInt(id) },
        data: { isActive },
        include: applianceTypeInclude,
      });
      return toApplianceType(row);
    } catch (error) {
      if (isPrismaError(error, 'P2025')) throw notFound('Appliance type');
      throw error;
    }
  }

  async deleteType(id: string): Promise<void> {
    const applianceTypeId = BigInt(id);
    try {
      await this.prisma.applianceType.delete({ where: { id: applianceTypeId } });
    } catch (error) {
      if (isPrismaError(error, 'P2025')) throw notFound('Appliance type');
      throw error;
    }
  }

  async createGroup(
    typeId: string,
    input: ApplianceFieldGroupInput,
  ): Promise<ApplianceFieldGroup> {
    const applianceTypeId = BigInt(typeId);
    await this.assertTypeExists(applianceTypeId);
    try {
      const last = await this.prisma.applianceTypeFieldGroup.findFirst({
        where: { applianceTypeId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      const row = await this.prisma.applianceTypeFieldGroup.create({
        data: {
          applianceTypeId,
          name: input.name,
          sortOrder: input.sortOrder ?? nextSortOrder(last?.sortOrder),
        },
        include: { fields: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] } },
      });
      return toGroup(row);
    } catch (error) {
      if (isPrismaError(error, 'P2002')) {
        throw new AppError('A field group with this name already exists', 409, 'APPLIANCE_FIELD_GROUP_EXISTS');
      }
      throw error;
    }
  }

  async updateGroup(
    typeId: string,
    groupId: string,
    input: ApplianceFieldGroupUpdateInput,
  ): Promise<ApplianceFieldGroup> {
    const applianceTypeId = BigInt(typeId);
    const id = BigInt(groupId);
    await this.assertGroupExists(applianceTypeId, id);
    try {
      const row = await this.prisma.applianceTypeFieldGroup.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
        },
        include: { fields: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] } },
      });
      return toGroup(row);
    } catch (error) {
      if (isPrismaError(error, 'P2002')) {
        throw new AppError('A field group with this name already exists', 409, 'APPLIANCE_FIELD_GROUP_EXISTS');
      }
      throw error;
    }
  }

  async deleteGroup(typeId: string, groupId: string): Promise<void> {
    const applianceTypeId = BigInt(typeId);
    const id = BigInt(groupId);
    await this.assertGroupExists(applianceTypeId, id);
    const fields = await this.prisma.applianceTypeField.findMany({
      where: { groupId: id },
      select: { fieldKey: true },
    });
    const fieldKeys = fields.map(({ fieldKey }) => fieldKey);
    if (fieldKeys.length > 0) {
      const externalDependents = await this.prisma.applianceTypeField.count({
        where: {
          applianceTypeId,
          dependsOn: { in: fieldKeys },
          OR: [{ groupId: { not: id } }, { groupId: null }],
        },
      });
      if (externalDependents > 0) {
        throw new AppError(
          'This group contains fields used as dependencies by other appliance fields',
          409,
          'APPLIANCE_FIELD_GROUP_IN_USE',
        );
      }
    }
    await this.prisma.applianceTypeFieldGroup.delete({ where: { id } });
  }

  async createField(
    typeId: string,
    groupId: string,
    input: ApplianceFieldInput,
  ): Promise<ApplianceField> {
    const applianceTypeId = BigInt(typeId);
    const id = BigInt(groupId);
    await this.assertGroupExists(applianceTypeId, id);
    await this.assertDependencyExists(applianceTypeId, input.key, input.dependsOn);
    try {
      const last = await this.prisma.applianceTypeField.findFirst({
        where: { groupId: id },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      const row = await this.prisma.applianceTypeField.create({
        data: {
          applianceTypeId,
          groupId: id,
          fieldKey: input.key,
          label: input.label,
          dataType: input.type,
          selectOptions: input.options.map(({ label, value }) => ({ label, value })),
          defaultValue: input.defaultValue ?? null,
          dependsOn: input.dependsOn ?? null,
          dependsOnValue: input.dependsOnValue ?? null,
          isRequired: input.required ?? false,
          sortOrder: input.sortOrder ?? nextSortOrder(last?.sortOrder),
          helpText: input.helpText ?? null,
        },
      });
      return toField(row);
    } catch (error) {
      if (isPrismaError(error, 'P2002')) {
        throw new AppError('A field with this key already exists for the appliance type', 409, 'APPLIANCE_FIELD_KEY_EXISTS');
      }
      throw error;
    }
  }

  async updateField(
    typeId: string,
    groupId: string,
    fieldId: string,
    input: ApplianceFieldUpdateInput,
  ): Promise<ApplianceField> {
    const applianceTypeId = BigInt(typeId);
    const targetGroupId = BigInt(groupId);
    const id = BigInt(fieldId);
    await this.assertGroupExists(applianceTypeId, targetGroupId);
    const current = await this.prisma.applianceTypeField.findFirst({
      where: { id, applianceTypeId, groupId: targetGroupId },
      select: { fieldKey: true, dependsOn: true },
    });
    if (!current) throw notFound('Appliance field');
    await this.assertDependencyExists(
      applianceTypeId,
      input.key ?? current.fieldKey,
      input.dependsOn === undefined ? current.dependsOn : input.dependsOn,
      id,
    );

    try {
      const row = await this.prisma.$transaction(async (transaction) => {
        const updated = await transaction.applianceTypeField.update({
          where: { id },
          data: {
            groupId: targetGroupId,
            ...this.fieldUpdateData(input),
          },
        });
        if (input.key !== undefined && input.key !== current.fieldKey) {
          await transaction.applianceTypeField.updateMany({
            where: { applianceTypeId, dependsOn: current.fieldKey },
            data: { dependsOn: input.key },
          });
        }
        return updated;
      });
      return toField(row);
    } catch (error) {
      if (isPrismaError(error, 'P2002')) {
        throw new AppError('A field with this key already exists for the appliance type', 409, 'APPLIANCE_FIELD_KEY_EXISTS');
      }
      if (isPrismaError(error, 'P2025')) throw notFound('Appliance field');
      throw error;
    }
  }

  async deleteField(typeId: string, groupId: string, fieldId: string): Promise<void> {
    const applianceTypeId = BigInt(typeId);
    const group = BigInt(groupId);
    const id = BigInt(fieldId);
    const field = await this.prisma.applianceTypeField.findFirst({
      where: { id, applianceTypeId, groupId: group },
      select: { fieldKey: true },
    });
    if (!field) throw notFound('Appliance field');
    const dependents = await this.prisma.applianceTypeField.count({
      where: { applianceTypeId, dependsOn: field.fieldKey },
    });
    if (dependents > 0) {
      throw new AppError(
        'This field is used as a dependency by other appliance fields',
        409,
        'APPLIANCE_FIELD_IN_USE',
      );
    }
    await this.prisma.applianceTypeField.delete({ where: { id } });
  }

  private fieldUpdateData(input: ApplianceFieldUpdateInput): Prisma.ApplianceTypeFieldUncheckedUpdateInput {
    const options: Prisma.InputJsonValue | undefined = input.options?.map(({ label, value }) => ({
      label,
      value,
    }));
    return {
      ...(input.key !== undefined ? { fieldKey: input.key } : {}),
      ...(input.label !== undefined ? { label: input.label } : {}),
      ...(input.type !== undefined ? { dataType: input.type } : {}),
      ...(options !== undefined ? { selectOptions: options } : {}),
      ...(input.defaultValue !== undefined ? { defaultValue: input.defaultValue } : {}),
      ...(input.dependsOn !== undefined ? { dependsOn: input.dependsOn } : {}),
      ...(input.dependsOnValue !== undefined ? { dependsOnValue: input.dependsOnValue } : {}),
      ...(input.required !== undefined ? { isRequired: input.required } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.helpText !== undefined ? { helpText: input.helpText } : {}),
    };
  }

  private async assertTypeExists(id: bigint): Promise<void> {
    const type = await this.prisma.applianceType.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!type) throw notFound('Appliance type');
  }

  private async assertGroupExists(applianceTypeId: bigint, id: bigint): Promise<void> {
    const group = await this.prisma.applianceTypeFieldGroup.findFirst({
      where: { id, applianceTypeId },
      select: { id: true },
    });
    if (!group) throw notFound('Appliance field group');
  }

  private async assertDependencyExists(
    applianceTypeId: bigint,
    fieldKey: string,
    dependsOn: string | null | undefined,
    fieldId?: bigint,
  ): Promise<void> {
    if (!dependsOn) return;
    const fields = await this.prisma.applianceTypeField.findMany({
      where: {
        applianceTypeId,
        ...(fieldId !== undefined ? { id: { not: fieldId } } : {}),
      },
      select: { fieldKey: true, dependsOn: true },
    });
    const fieldsByKey = new Map(fields.map((field) => [field.fieldKey, field]));
    let dependencyKey: string | null = dependsOn;
    const visited = new Set<string>();

    while (dependencyKey !== null) {
      if (dependencyKey === fieldKey) {
        throw new AppError(
          'Appliance field dependencies cannot contain cycles',
          422,
          'INVALID_APPLIANCE_FIELD_DEPENDENCY',
        );
      }
      if (visited.has(dependencyKey)) {
        throw new Error('Stored appliance field dependencies contain a cycle.');
      }
      visited.add(dependencyKey);
      const dependency = fieldsByKey.get(dependencyKey);
      if (!dependency) {
        throw new AppError(
          'The dependent appliance field was not found',
          422,
          'APPLIANCE_FIELD_DEPENDENCY_NOT_FOUND',
        );
      }
      dependencyKey = dependency.dependsOn;
    }
  }
}

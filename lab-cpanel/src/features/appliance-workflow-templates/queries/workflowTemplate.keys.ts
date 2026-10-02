export const workflowTemplateKeys = {
  all: ['workflowTemplates'] as const,
  list: () => [...workflowTemplateKeys.all, 'list'] as const,
  options: () => [...workflowTemplateKeys.all, 'options'] as const,
}

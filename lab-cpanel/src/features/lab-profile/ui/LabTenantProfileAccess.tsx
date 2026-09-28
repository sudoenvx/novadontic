import { FileCheck, Upload } from "lucide-react";

import type { LabTenantProfile } from "../domain/labTenantProfile";
import { Badge } from "../../../shared/ui/Badge";
import { Button } from "../../../shared/ui/Button";
import { Card, CardHeader, CardTitle } from "../../../shared/ui/Card";

type LabTenantProfileAccessProps = {
  profile: LabTenantProfile;
  onRequestAction: (action: string) => void;
};

export function LabTenantProfileAccess({
  profile,
  onRequestAction,
}: LabTenantProfileAccessProps) {
  return (
    <div className="grid min-w-0 content-start gap-3">
      <AccountOwnerCard profile={profile} onRequestAction={onRequestAction} />
      <ComplianceCard profile={profile} onRequestAction={onRequestAction} />
    </div>
  );
}

function AccountOwnerCard({
  profile,
  onRequestAction,
}: {
  profile: LabTenantProfile;
  onRequestAction: (action: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account owner</CardTitle>
      </CardHeader>
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary-soft-foreground">
          {profile.accountOwner.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-text-primary">
            {profile.accountOwner.name}
          </p>
          <p className="break-all text-sm text-text-secondary">
            {profile.accountOwner.email}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="neutral"
        className="w-full"
        onClick={() => onRequestAction("Team management")}
      >
        Manage team
      </Button>
    </Card>
  );
}

function ComplianceCard({
  profile,
  onRequestAction,
}: {
  profile: LabTenantProfile;
  onRequestAction: (action: string) => void;
}) {
  const missingCount = profile.complianceRequirements.filter(
    (requirement) => !requirement.isProvided,
  ).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Compliance documents</CardTitle>
          <p className="mt-1 text-sm text-text-secondary">
            Required files for this laboratory account.
          </p>
        </div>
        <Badge tone={missingCount > 0 ? "warning" : "success"}>
          {missingCount > 0 ? `${missingCount} needed` : "Complete"}
        </Badge>
      </CardHeader>
      <ul className="grid gap-2">
        {profile.complianceRequirements.map((requirement) => (
          <li
            key={requirement.id}
            className="flex min-w-0 items-start gap-2 border-t border-border-soft py-2 first:border-t-0"
          >
            <span
              className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-xs ${requirement.isProvided ? "bg-success-soft text-success-soft-foreground" : "bg-warning-soft text-warning-soft-foreground"}`}
            >
              {requirement.isProvided ? (
                <FileCheck size={15} aria-hidden="true" />
              ) : (
                <Upload size={15} aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-sm font-semibold text-text-primary">
                  {requirement.name}
                </p>
                <Badge tone={requirement.isProvided ? "success" : "warning"}>
                  {requirement.isProvided ? "Provided" : "Needed"}
                </Badge>
              </div>
              <p className="wrap-break-word text-xs text-text-secondary">
                {requirement.isProvided
                  ? [requirement.fileName, requirement.uploadedAt]
                      .filter(Boolean)
                      .join(" · ")
                  : requirement.description}
              </p>
              {requirement.expiresAt && (
                <p className="text-xs text-text-secondary">
                  {requirement.expiresAt}
                </p>
              )}
              {!requirement.isProvided && (
                <Button
                  type="button"
                  variant="neutral"
                  size="xs"
                  className="mt-1.5"
                  onClick={() => onRequestAction("Document upload")}
                >
                  <Upload size={13} aria-hidden="true" />
                  Upload
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
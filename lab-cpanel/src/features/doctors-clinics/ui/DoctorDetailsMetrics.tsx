import { StatisticCard } from '../../../shared/ui/StatisticCard'
import type { Doctor } from '../domain/doctor'
import type { DoctorDetails } from '../domain/doctorDetails'

export function DoctorDetailsMetrics({ doctor, details }: { doctor: Doctor; details: DoctorDetails }) {
  return (
    <section className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Doctor metrics">
      <StatisticCard label="Active cases" value={String(doctor.activeCases)} detail="in progress now" />
      <StatisticCard label="Total cases" value={String(details.totalCases)} detail={`since ${details.memberSince}`} />
      <StatisticCard label="On-time rate" value={details.onTimeRate} detail="last 12 months" />
      <StatisticCard label="Avg turnaround" value={details.averageTurnaround} detail="received → delivered" />
    </section>
  )
}

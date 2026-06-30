"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { PayFlow } from "@/components/PayFlow";
import type { PaymentKind } from "@/lib/payments";

const VALID_JOBS: PaymentKind[] = ["yaka", "water", "airtime", "send"];

export default function PayJobPage() {
  const params = useParams<{ job: string }>();
  const job = params.job as PaymentKind;

  if (!VALID_JOBS.includes(job)) {
    notFound();
  }

  return <PayFlow job={job} />;
}

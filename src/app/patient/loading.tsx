import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientProfileLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="mb-1 h-4 w-20" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

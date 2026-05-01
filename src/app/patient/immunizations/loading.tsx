import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ImmunizationsLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-44" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

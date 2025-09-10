import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DashboardData {
  stats: {
    totalClients: number
    suitableClients: number
    potentialClients: number
    notSuitableClients: number
    averageScore: number
    averagePoints: number
  }
  // ... otras propiedades
}

interface SectionCardsProps {
  dashboardData: DashboardData
}

export function SectionCards({ dashboardData }: SectionCardsProps) {
  const {
    totalClients,
    suitableClients,
    potentialClients,
    notSuitableClients,
    averageScore
  } = dashboardData.stats

  // Calcular leads calificados (aptos + potenciales)
  const qualifiedLeads = suitableClients + potentialClients
  
  // Calcular tasa de conversión (leads calificados / total)
  const conversionRate = totalClients > 0 
    ? Math.round((qualifiedLeads / totalClients) * 100) 
    : 0

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total de ingresos al formulario */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de Ingresos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalClients}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +{totalClients}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total de formularios recibidos <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Todos los formularios completados
          </div>
        </CardFooter>
      </Card>

      {/* Leads calificados */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Leads Calificados</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {qualifiedLeads}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
              <IconTrendingUp />
              {qualifiedLeads > 0 ? Math.round((qualifiedLeads / totalClients) * 100) : 0}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Aptos y potenciales <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {suitableClients} aptos, {potentialClients} potenciales
          </div>
        </CardFooter>
      </Card>

      {/* Leads no calificados */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Leads No Calificados</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {notSuitableClients}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
              <IconTrendingDown />
              {notSuitableClients > 0 ? Math.round((notSuitableClients / totalClients) * 100) : 0}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            No aptos para seguimiento <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Requieren reevaluación
          </div>
        </CardFooter>
      </Card>

      {/* Tasa de conversión */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tasa de Conversión</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {conversionRate}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {conversionRate >= 50 ? <IconTrendingUp /> : <IconTrendingDown />}
              {conversionRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {conversionRate >= 50 ? "Buena tasa de conversión" : "Tasa de conversión a mejorar"} 
            {conversionRate >= 50 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Porcentaje de leads calificados
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
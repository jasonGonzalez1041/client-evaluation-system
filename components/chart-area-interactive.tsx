"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

// Interface para los datos del dashboard
interface DashboardData {
  stats: {
    totalClients: number
    suitableClients: number
    potentialClients: number
    notSuitableClients: number
    averageScore: number
    averagePoints: number
  }
  charts: {
    monthlyClients: {
      month: string
      suitable: number
      potential: number
      not_suitable: number
      total: number
    }[]
    // ... otras propiedades
  }
  // ... resto de propiedades
}

interface ChartAreaInteractiveProps {
  dashboardData: DashboardData
}

// Configuración del gráfico
const chartConfig = {
  suitable: {
    label: "Aptos",
    color: "var(--chart-1)",
  },
  potential: {
    label: "Potenciales",
    color: "var(--chart-2)",
  },
  not_suitable: {
    label: "No Aptos",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ dashboardData }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("6m")
  
  // Procesar datos mensuales para el gráfico
  const chartData = React.useMemo(() => {
    if (!dashboardData?.charts?.monthlyClients) return []
    
    return dashboardData.charts.monthlyClients.map(item => ({
      month: item.month,
      suitable: item.suitable,
      potential: item.potential,
      not_suitable: item.not_suitable,
      total: item.total
    }))
  }, [dashboardData])

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("3m")
    }
  }, [isMobile])

  // Filtrar datos según el rango de tiempo seleccionado
  const filteredData = React.useMemo(() => {
    if (timeRange === "all") return chartData
    
    const monthsToShow = timeRange === "3m" ? 3 : 6
    return chartData.slice(-monthsToShow)
  }, [chartData, timeRange])

  if (!dashboardData) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Evolución de Leads</CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[250px] w-full flex items-center justify-center">
            <p>Cargando datos del gráfico...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Evolución de Leads</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Distribución de leads por estado de evaluación
          </span>
          <span className="@[540px]/card:hidden">Leads por estado</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="6m">6 meses</ToggleGroupItem>
            <ToggleGroupItem value="3m">3 meses</ToggleGroupItem>
            <ToggleGroupItem value="all">Todo</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Seleccionar rango de tiempo"
            >
              <SelectValue placeholder="6 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="6m" className="rounded-lg">
                6 meses
              </SelectItem>
              <SelectItem value="3m" className="rounded-lg">
                3 meses
              </SelectItem>
              <SelectItem value="all" className="rounded-lg">
                Todo
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillSuitable" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-suitable)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-suitable)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillPotential" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-potential)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-potential)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillNotSuitable" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-not_suitable)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-not_suitable)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => value.split(' ')[0]} // Mostrar solo el mes
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return value
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="suitable"
              type="natural"
              fill="url(#fillSuitable)"
              stroke="var(--color-suitable)"
              stackId="a"
            />
            <Area
              dataKey="potential"
              type="natural"
              fill="url(#fillPotential)"
              stroke="var(--color-potential)"
              stackId="a"
            />
            <Area
              dataKey="not_suitable"
              type="natural"
              fill="url(#fillNotSuitable)"
              stroke="var(--color-not_suitable)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
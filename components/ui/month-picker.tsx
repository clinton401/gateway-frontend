"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface MonthPickerProps {
  value: string // YYYY-MM format
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  required?: boolean
  id?: string
  minDate?: Date
  maxDate?: Date
  startMonth?: Date // Custom start month for calendar navigation
  endMonth?: Date   // Custom end month for calendar navigation
}

function formatMonthYear(dateStr: string | undefined): string {
  if (!dateStr) return ""
  
  try {
    // Parse YYYY-MM format
    const [year, month] = dateStr.split("-")
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  } catch {
    return ""
  }
}

function stringToDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined
  
  try {
    const [year, month] = dateStr.split("-")
    return new Date(parseInt(year), parseInt(month) - 1, 1)
  } catch {
    return undefined
  }
}

function dateToString(date: Date | undefined): string {
  if (!date || isNaN(date.getTime())) return ""
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

function isValidMonthString(value: string): boolean {
  const regex = /^\d{4}-(0[1-9]|1[0-2])$/
  return regex.test(value)
}

export function MonthPicker({
  value,
  onChange,
  label,
  placeholder = "Select month",
  disabled = false,
  error,
  required = false,
  id,
  minDate,
  maxDate,
  startMonth,
  endMonth,
}: MonthPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(stringToDate(value))
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [displayValue, setDisplayValue] = React.useState(formatMonthYear(value))

  // Sync with external value changes
  React.useEffect(() => {
    const newDate = stringToDate(value)
    setDate(newDate)
    setMonth(newDate)
    setDisplayValue(formatMonthYear(value))
  }, [value])

  const handleInputChange = (inputValue: string) => {
    setDisplayValue(inputValue)

    // Try to parse various date formats
    const parsedDate = new Date(inputValue)
    
    if (!isNaN(parsedDate.getTime())) {
      const dateString = dateToString(parsedDate)
      if (isValidMonthString(dateString)) {
        setDate(parsedDate)
        setMonth(parsedDate)
        onChange(dateString)
      }
    }
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return
    
    setDate(selectedDate)
    setMonth(selectedDate)
    setDisplayValue(formatMonthYear(dateToString(selectedDate)))
    onChange(dateToString(selectedDate))
    setOpen(false)
  }

  const defaultStartMonth = startMonth ?? new Date(1960, 0, 1)
  const defaultEndMonth = endMonth ?? new Date(new Date().getFullYear() + 10, 11, 31)

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <Label htmlFor={id} className="px-1">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="relative flex gap-2">
        <Input
          id={id}
          value={displayValue}
          placeholder={placeholder}
          className={cn(
            "bg-background pr-10",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
          disabled={disabled}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
              disabled={disabled}
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleDateSelect}
              disabled={(date) => {
                if (minDate && date < minDate) return true
                if (maxDate && date > maxDate) return true
                return false
              }}
              startMonth={defaultStartMonth}
              endMonth={defaultEndMonth}
            />
          </PopoverContent>
        </Popover>
      </div>
      {error && (
        <p className="text-sm text-destructive px-1">{error}</p>
      )}
    </div>
  )
}
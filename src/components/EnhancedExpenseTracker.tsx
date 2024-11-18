'use client'

import { useState, useEffect } from 'react'
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths, subYears } from 'date-fns'
import { CalendarIcon, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ExpenseForm from './ExpenseForm'
import ExpenseList from './ExpenseList'

interface ChartDataPoint {
  date: string
  current: number
  previous: number
}

interface Expense {
  id: number
  amount: number
  category: string
  date: string | Date
}

export default function EnhancedExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const savedExpenses = localStorage.getItem('expenses')
    return savedExpenses ? JSON.parse(savedExpenses) : []
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [totalTimeFrame, setTotalTimeFrame] = useState('day')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])

  const onSubmit = (values) => {
    const newExpense = {
      id: Date.now(),
      amount: parseFloat(values.amount),
      category: values.category,
      date: new Date(),
    }
    setExpenses([newExpense, ...expenses])
    setAlertMessage('Expense created successfully!')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleEdit = (id, newAmount) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id ? { ...expense, amount: parseFloat(newAmount) } : expense
      )
    )
    setEditingId(null)
    setAlertMessage('Expense updated successfully!')
    setShowAlert(true)
    setTimeout(() => {
      setShowAlert(false)
      setIsPaused(false)
    }, 3000)
  }

  const handleDelete = (id) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
    setAlertMessage('Expense deleted successfully!')
    setShowAlert(true)
    setTimeout(() => {
      setShowAlert(false)
      setIsPaused(false)
    }, 3000)
  }

  const calculateTotal = () => {
    return getFilteredExpenses()
      .reduce((sum, expense) => sum + expense.amount, 0)
      .toFixed(2)
  }

  const getFilteredExpenses = () => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      switch (totalTimeFrame) {
        case 'day':
          return (
            expenseDate >= startOfDay(selectedDate) &&
            expenseDate <= endOfDay(selectedDate)
          )
        case 'month':
          return (
            expenseDate >= startOfMonth(selectedDate) &&
            expenseDate <= endOfMonth(selectedDate)
          )
        case 'year':
          return (
            expenseDate >= startOfYear(selectedDate) &&
            expenseDate <= endOfYear(selectedDate)
          )
        default:
          return true
      }
    })
  }

  const getChartData = (): ChartDataPoint[] => {
    const currentPeriodExpenses = getFilteredExpenses()
    const previousPeriodExpenses = getPreviousPeriodExpenses()

    const data: Record<string, { current: number; previous: number }> = {}
    
    currentPeriodExpenses.forEach((expense) => {
      const date = format(new Date(expense.date), 'yyyy-MM-dd')
      if (data[date]) {
        data[date].current += expense.amount
      } else {
        data[date] = { current: expense.amount, previous: 0 }
      }
    })

    previousPeriodExpenses.forEach((expense) => {
      const date = format(new Date(expense.date), 'yyyy-MM-dd')
      if (data[date]) {
        data[date].previous += expense.amount
      } else {
        data[date] = { current: 0, previous: expense.amount }
      }
    })

    return Object.entries(data).map(([date, amounts]) => ({
      date,
      current: amounts.current,
      previous: amounts.previous,
    }))
  }

  const getPreviousPeriodExpenses = () => {
    let startDate, endDate
    switch (totalTimeFrame) {
      case 'day':
        startDate = subMonths(startOfDay(selectedDate), 1)
        endDate = subMonths(endOfDay(selectedDate), 1)
        break
      case 'month':
        startDate = subMonths(startOfMonth(selectedDate), 1)
        endDate = subMonths(endOfMonth(selectedDate), 1)
        break
      case 'year':
        startDate = subYears(startOfYear(selectedDate), 1)
        endDate = subYears(endOfYear(selectedDate), 1)
        break
      default:
        return []
    }

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= startDate && expenseDate <= endDate
    })
  }

  const resetData = () => {
    setExpenses([])
    localStorage.removeItem('expenses')
    setAlertMessage('All data has been reset!')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-slate-800 animate-fade-in-down">
        Enhanced Expense Tracker
      </h1>

      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="mb-4 fixed top-4 right-4 z-50"
          >
            <Alert className="bg-green-100 border-green-400 text-green-700">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ExpenseForm onSubmit={onSubmit} />
        <ExpenseList
          expenses={getFilteredExpenses()}
          editingId={editingId}
          setEditingId={setEditingId}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          setIsPaused={setIsPaused}
          selectedDate={selectedDate}
          totalTimeFrame={totalTimeFrame}
        />
      </div>

      <Card className="mt-8 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-700">Expense Summary</CardTitle>
          <CardDescription>View your total expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Label>Time Frame:</Label>
            <Select
              onValueChange={(value) => {
                setTotalTimeFrame(value)
                setSelectedDate(new Date())
              }}
              defaultValue={totalTimeFrame}
            >
              <SelectTrigger className="w-[180px] bg-white/50">
                <SelectValue placeholder="Select time frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-4 mb-4">
            <Label>Select Date:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal bg-white/50"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(
                      selectedDate,
                      totalTimeFrame === 'year'
                        ? 'yyyy'
                        : totalTimeFrame === 'month'
                        ? 'MMMM yyyy'
                        : 'PPP'
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="text-3xl font-bold text-slate-800">
            Total: ₵{calculateTotal()}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-700">Expense Comparison Chart</CardTitle>
          <CardDescription>Compare current expenses with previous period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="current"
                name="Current Period"
                stroke="#334155"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="previous"
                name="Previous Period"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <Button
            onClick={resetData}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

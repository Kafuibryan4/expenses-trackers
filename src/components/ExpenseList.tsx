import { AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ExpenseItem from './ExpenseItem'
import { format } from 'date-fns'

interface ExpenseListProps {
  expenses: Array<{
    id: number
    amount: number
    category: string
    date: Date | string
  }>
  editingId: number | null
  setEditingId: (id: number | null) => void
  handleEdit: (id: number, amount: string) => void
  handleDelete: (id: number) => void
  setIsPaused: (isPaused: boolean) => void
  selectedDate: Date
  totalTimeFrame: string
}

export default function ExpenseList({
  expenses,
  editingId,
  setEditingId,
  handleEdit,
  handleDelete,
  setIsPaused,
  selectedDate,
  totalTimeFrame,
}: ExpenseListProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl">Filtered Expenses</CardTitle>
        <CardDescription className="text-slate-300 font-semibold">
          {`Expenses for ${totalTimeFrame === 'day' ? 'the selected day' : totalTimeFrame === 'month' ? 'the selected month' : 'the selected year'}:`}
          <br />
          <span className="text-xl font-bold">
            {format(selectedDate, totalTimeFrame === 'year' ? 'yyyy' : totalTimeFrame === 'month' ? 'MMMM yyyy' : 'MMMM do, yyyy')}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-y-auto">
          <AnimatePresence>
            {expenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                editingId={editingId}
                onEdit={handleEdit}
                onDelete={handleDelete}
                setEditingId={setEditingId}
                setIsPaused={setIsPaused}
              />
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
import { useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

interface ExpenseItemProps {
  expense: {
    id: number
    amount: number
    category: string
    date: Date | string
  }
  editingId: number | null
  onEdit: (id: number, amount: string) => void
  onDelete: (id: number) => void
  setEditingId: (id: number | null) => void
  setIsPaused: (isPaused: boolean) => void
}

export default function ExpenseItem({ 
  expense, 
  editingId, 
  onEdit, 
  onDelete, 
  setEditingId, 
  setIsPaused 
}: ExpenseItemProps) {
  const x = useMotionValue(0)
  const background = useTransform(
    x,
    [-100, 0, 100],
    ['rgba(239, 68, 68, 0.2)', 'rgba(255, 255, 255, 0.95)', 'rgba(34, 197, 94, 0.2)']
  )
  const [editAmount, setEditAmount] = useState(expense.amount.toFixed(2))

  return (
    <motion.div
      style={{ x, background }}
      onTapStart={() => setIsPaused(true)}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(event, info) => {
        if (info.offset.x < -50) {
          onDelete(expense.id)
        } else if (info.offset.x > 50) {
          setEditingId(expense.id)
        }
        setIsPaused(false)
      }}
      className="bg-white/95 backdrop-blur-sm p-4 rounded-lg mb-4 shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing hover:shadow-lg hover:scale-102 border border-slate-200"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-slate-800">{expense.category}</h3>
          <p className="text-sm text-slate-600">
            {format(new Date(expense.date), 'PPpp')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {editingId === expense.id ? (
            <>
              <Input
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="w-24 bg-white/50 text-slate-700"
              />
              <Button
                onClick={() => onEdit(expense.id, editAmount)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Save className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <span className="font-bold text-slate-700">₵{expense.amount.toFixed(2)}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
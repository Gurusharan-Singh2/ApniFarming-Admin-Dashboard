"use client"

import React, { useEffect, useState } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

type Task = {
  id: string
  text: string
  date: string
  completed: boolean
}

const TodoList = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Load tasks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("tasks")
    if (stored) setTasks(JSON.parse(stored))
  }, [])

  // Save to localStorage when tasks change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!newTask.trim() || !selectedDate) return
    const newEntry: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      date: format(selectedDate, "yyyy-MM-dd"),
      completed: false,
    }
    setTasks([...tasks, newEntry])
    setNewTask("")
  }

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const filteredTasks = tasks.filter(task => task.date === format(selectedDate || new Date(), "yyyy-MM-dd"))

  return (
    <div className="max-w-xl mx-auto mt-6 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Enter task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {format(selectedDate || new Date(), "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button onClick={addTask}>Add</Button>
      </div>

      <ScrollArea className="max-h-[400px]">
        {filteredTasks.length === 0 && (
          <p className="text-muted-foreground text-sm text-center">No tasks for selected day</p>
        )}
        {filteredTasks.map(task => (
          <Card key={task.id} className="mb-2 p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleComplete(task.id)}
                />
                <Label className={task.completed ? "line-through text-muted-foreground" : ""}>
                  {task.text}
                </Label>
              </div>
              <Button size="sm" variant="destructive" onClick={() => deleteTask(task.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </ScrollArea>
    </div>
  )
}

export default TodoList

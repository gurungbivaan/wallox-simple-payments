import { Transaction } from "@/components/TransactionItem";

export const recentTransactions: Transaction[] = [
  { id: "1", name: "Arun Sharma", type: "sent", amount: 1500, date: "Today, 2:30 PM", icon: "send" },
  { id: "2", name: "Salary Credit", type: "received", amount: 45000, date: "Today, 10:00 AM", icon: "receive" },
  { id: "3", name: "NEA Electricity", type: "bill", amount: 2340, date: "Yesterday", icon: "bill" },
  { id: "4", name: "Bhat-Bhateni Store", type: "merchant", amount: 890, date: "Yesterday", icon: "merchant" },
  { id: "5", name: "Priya Thapa", type: "received", amount: 500, date: "Mar 5", icon: "receive" },
  { id: "6", name: "WorldLink Internet", type: "bill", amount: 1200, date: "Mar 4", icon: "bill" },
  { id: "7", name: "Ncell Recharge", type: "bill", amount: 500, date: "Mar 3", icon: "bill" },
  { id: "8", name: "Coffee Pasal", type: "merchant", amount: 350, date: "Mar 2", icon: "merchant" },
];

export const billCategories = [
  { id: "electricity", name: "Electricity", icon: "⚡", provider: "NEA", color: "bg-warning/15 text-warning" },
  { id: "internet", name: "Internet", icon: "🌐", provider: "WorldLink", color: "bg-info/15 text-info" },
  { id: "water", name: "Water", icon: "💧", provider: "KUKL", color: "bg-primary/15 text-primary" },
  { id: "mobile", name: "Mobile", icon: "📱", provider: "Ncell / NTC", color: "bg-accent/15 text-accent" },
  { id: "tv", name: "Cable TV", icon: "📺", provider: "DishHome", color: "bg-destructive/15 text-destructive" },
  { id: "insurance", name: "Insurance", icon: "🛡️", provider: "Various", color: "bg-success/15 text-success" },
];

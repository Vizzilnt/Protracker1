
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Task, TASK_TYPE_LABELS, ToDoItem, TODO_CATEGORY_LABELS } from '../types';

const formatDuration = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins} mins`;
  if (mins === 0) return `${hrs} hrs`;
  return `${hrs} hrs, ${mins} mins`;
};

const drawLogo = (doc: jsPDF, x: number, y: number, size: number) => {
  const s = size / 100;
  
  // Path 1: Dark Grey Segment (Base)
  doc.setFillColor(51, 65, 85); // Slate-800 #334155
  // Start at (20, 80) relative to 100x100 box
  doc.lines(
    [[30 * s, -30 * s], [0, 15 * s], [-15 * s, 15 * s]], 
    x + 20 * s, 
    y + 80 * s, 
    [1, 1], 
    'F', 
    true
  );

  // Path 2: Blue Segment (Arrow Up)
  doc.setFillColor(37, 99, 235); // Blue-600 #2563eb
  // Start at (50, 50)
  // Vectors derived from: M50 50 L80 20 L80 45 L65 60 L50 45 Z
  doc.lines(
    [[30 * s, -30 * s], [0, 25 * s], [-15 * s, 15 * s], [-15 * s, -15 * s]],
    x + 50 * s,
    y + 50 * s,
    [1, 1],
    'F',
    true
  );

  // Path 3: Arrow Head (Stroke)
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(8 * s);
  doc.setLineCap('round');
  doc.setLineJoin('round');
  // M60 20 L80 20
  doc.line(x + 60 * s, y + 20 * s, x + 80 * s, y + 20 * s);
  // L80 40
  doc.line(x + 80 * s, y + 20 * s, x + 80 * s, y + 40 * s);
};

export const generatePDFReport = (tasks: Task[], todos: ToDoItem[], startDate: string, endDate: string, userName: string) => {
  const doc = new jsPDF();

  // --- Header ---
  
  // Draw Logo at x=14, y=10, size=12mm
  drawLogo(doc, 14, 10, 12);

  // Title
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('ProTracker Activity Report', 30, 20);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`User: ${userName}`, 14, 32);
  doc.text(`Period: ${startDate} to ${endDate}`, 14, 38);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 44);

  // --- Activity Summary ---
  
  const typeSummary: Record<string, number> = {};
  let totalMinutes = 0;

  tasks.forEach(task => {
    const minutes = task.durationMinutes;
    totalMinutes += minutes;
    if (!typeSummary[task.type]) typeSummary[task.type] = 0;
    typeSummary[task.type] += minutes;
  });

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`Activity Summary (Total: ${formatDuration(totalMinutes)})`, 14, 58);

  const summaryData = Object.entries(typeSummary).map(([type, minutes]) => [
    // @ts-ignore
    TASK_TYPE_LABELS[type] || type,
    formatDuration(minutes),
    `${((minutes / totalMinutes) * 100).toFixed(1)}%`
  ]);

  autoTable(doc, {
    startY: 64,
    head: [['Task Type', 'Total Duration', '% of Total']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10, cellPadding: 3 }
  });

  // --- Detailed Logs ---
  
  // @ts-ignore
  let finalY = doc.lastAutoTable.finalY || 100;
  
  doc.setFontSize(14);
  doc.text('Detailed Activity Log', 14, finalY + 15);

  const tableData = tasks
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(task => [
      task.date,
      `${task.startTime} - ${task.endTime}`,
      // @ts-ignore
      TASK_TYPE_LABELS[task.type] || task.type,
      task.description,
      formatDuration(task.durationMinutes)
    ]);

  autoTable(doc, {
    startY: finalY + 20,
    head: [['Date', 'Time', 'Type', 'Description', 'Duration']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 35 },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 30 }
    },
    headStyles: { fillColor: [30, 41, 59] }
  });

  // --- To-Do List Section ---
  
  // Filter To-Dos relevant to the period
  // We include todos that have a deadline within the range, OR if no deadline, were created in the range.
  const relevantTodos = todos.filter(todo => {
    const targetDate = todo.deadline || todo.createdAt.split('T')[0];
    return targetDate >= startDate && targetDate <= endDate;
  });

  const completedTodos = relevantTodos.filter(t => t.completed);
  const pendingTodos = relevantTodos.filter(t => !t.completed);

  // @ts-ignore
  finalY = doc.lastAutoTable.finalY || finalY;
  
  // Start a new page for Planner if space is tight
  if (finalY > 220) {
      doc.addPage();
      finalY = 20;
  } else {
      finalY += 20;
  }

  if (relevantTodos.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Planner & To-Do Overview', 14, finalY);
    
    finalY += 10;

    // Completed Tasks Table
    if (completedTodos.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(22, 163, 74); // Green
      doc.text(`Completed Tasks (${completedTodos.length})`, 14, finalY);

      const completedData = completedTodos.map(t => [
        t.deadline || 'No Deadline',
        TODO_CATEGORY_LABELS[t.category],
        t.text,
        t.notes || '-'
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [['Deadline', 'Category', 'Task', 'Notes']],
        body: completedData,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] }, // Green header
        styles: { fontSize: 9 }
      });
      
      // @ts-ignore
      finalY = doc.lastAutoTable.finalY + 10;
    } else {
       doc.setFontSize(10);
       doc.setTextColor(150);
       doc.text('No completed tasks recorded for this period.', 14, finalY);
       finalY += 15;
    }

    // Pending Tasks Table
    if (pendingTodos.length > 0) {
      // Check for page break
      if (finalY > 250) {
          doc.addPage();
          finalY = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(220, 38, 38); // Red
      doc.text(`Pending / Remaining Tasks (${pendingTodos.length})`, 14, finalY);

      const pendingData = pendingTodos.map(t => [
        t.deadline || 'No Deadline',
        TODO_CATEGORY_LABELS[t.category],
        t.text,
        t.notes || '-'
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [['Deadline', 'Category', 'Task', 'Notes']],
        body: pendingData,
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38] }, // Red header
        styles: { fontSize: 9 }
      });
    } else {
       doc.setFontSize(10);
       doc.setTextColor(150);
       doc.text('No pending tasks remaining for this period.', 14, finalY);
    }
  } else {
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('No To-Do items found for this period.', 14, finalY + 10);
  }

  doc.save(`ProTracker-Report-${startDate}-${endDate}.pdf`);
};

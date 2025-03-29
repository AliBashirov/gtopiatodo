
import React, { useState, useEffect } from 'react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  category: string;
  dueDate: string;
  priority: string;
  createdAt: string;
}

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState('all');
  const [taskInput, setTaskInput] = useState('');
  const [categorySelect, setCategorySelect] = useState('personal');
  const [dueDateInput, setDueDateInput] = useState('');
  const [prioritySelect, setPrioritySelect] = useState('medium');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    // Load tasks from localStorage when component mounts
    const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    setTasks(savedTasks);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (taskInput.trim() === '') {
      showAlert('Please enter a task', 'error');
      return;
    }
    
    const newTask = {
      id: Date.now(),
      text: taskInput,
      completed: false,
      category: categorySelect,
      dueDate: dueDateInput,
      priority: prioritySelect,
      createdAt: new Date().toISOString()
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    // Reset input fields
    setTaskInput('');
    setDueDateInput('');
    setCategorySelect('personal');
    setPrioritySelect('medium');
    
    showAlert('Task added successfully', 'success');
  };
  
  const filterTasks = (filterType: string) => {
    setFilter(filterType);
  };
  
  const clearCompleted = () => {
    const updatedTasks = tasks.filter(task => !task.completed);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    showAlert('Completed tasks cleared', 'info');
  };
  
  const toggleComplete = (id: number) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? {...task, completed: !task.completed} : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };
  
  const deleteTask = (id: number) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    showAlert('Task deleted', 'info');
  };
  
  const editTask = (id: number, newText: string) => {
    if (newText.trim() === '') return;
    
    const updatedTasks = tasks.map(task => 
      task.id === id ? {...task, text: newText} : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    showAlert('Task updated', 'success');
  };
  
  const showAlert = (message: string, type: string) => {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    
    const todoApp = document.querySelector('.todo-app');
    if (todoApp) {
      todoApp.prepend(alert);
      
      setTimeout(() => {
        alert.remove();
      }, 3000);
    }
  };
  
  // Filter and sort tasks
  const getFilteredTasks = () => {
    // Filter tasks based on current filter
    let filteredTasks = [...tasks];
    
    // Apply search filter if searchInput has text
    if (searchInput.trim() !== '') {
      filteredTasks = filteredTasks.filter(task => 
        task.text.toLowerCase().includes(searchInput.toLowerCase())
      );
    }
    
    // Apply completed/active filters
    if (filter === 'active') {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
      filteredTasks = filteredTasks.filter(task => task.completed);
    }
    
    // Sort tasks by priority and date
    return [...filteredTasks].sort((a, b) => {
      const priorityValues: {[key: string]: number} = {high: 3, medium: 2, low: 1};
      return priorityValues[b.priority] - priorityValues[a.priority] || 
        new Date(a.dueDate || '9999-12-31').getTime() - new Date(b.dueDate || '9999-12-31').getTime();
    });
  };
  
  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, taskId: number) => {
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.setData('text/plain', taskId.toString());
  };

  const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e: React.DragEvent<HTMLUListElement>) => {
    e.preventDefault();
    const taskList = e.currentTarget;
    const draggingItem = document.querySelector('.dragging') as HTMLElement;
    if (!draggingItem || !taskList) return;
    
    const siblings = Array.from(taskList.querySelectorAll('.task-item:not(.dragging)')) as HTMLElement[];
    const nextSibling = siblings.find(sibling => {
      return e.clientY < sibling.getBoundingClientRect().top + sibling.getBoundingClientRect().height / 2;
    });
    
    if (nextSibling) {
      taskList.insertBefore(draggingItem, nextSibling);
    } else {
      taskList.appendChild(draggingItem);
    }
  };

  // Theme toggle functionality
  const toggleTheme = () => {
    document.body.classList.toggle('dark');
    const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="todo-app bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-xl w-full max-w-2xl p-6 transition-all duration-300">
        <div className="app-header flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">GlowTopia Tasks</h1>
          <button id="theme-toggle" className="p-2 rounded-full bg-gray-200 dark:bg-gray-700" onClick={toggleTheme}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden dark:block text-yellow-400">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block dark:hidden text-gray-700">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
        </div>
        
        <div className="search-container mb-6">
          <div className="relative">
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tasks..." 
              className="w-full p-3 pl-10 bg-gray-100/70 dark:bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-3.5 text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <input 
              type="text" 
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="What do you need to do?" 
              className="w-full p-3 bg-gray-100/70 dark:bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <select 
                value={categorySelect}
                onChange={(e) => setCategorySelect(e.target.value)}
                className="w-full p-3 bg-gray-100/70 dark:bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="shopping">Shopping</option>
                <option value="health">Health</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <input 
                type="date" 
                value={dueDateInput}
                onChange={(e) => setDueDateInput(e.target.value)}
                className="w-full p-3 bg-gray-100/70 dark:bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            
            <div>
              <select 
                value={prioritySelect}
                onChange={(e) => setPrioritySelect(e.target.value)}
                className="w-full p-3 bg-gray-100/70 dark:bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md"
          >
            Add Task
          </button>
        </form>
        
        <div className="filters mb-4">
          <div className="flex space-x-2">
            <button 
              onClick={() => filterTasks('all')} 
              className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg ${filter === 'all' ? 'bg-gradient-to-r from-purple-500/70 to-pink-500/70 text-white' : ''}`}
            >
              All
            </button>
            <button 
              onClick={() => filterTasks('active')} 
              className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg ${filter === 'active' ? 'bg-gradient-to-r from-purple-500/70 to-pink-500/70 text-white' : ''}`}
            >
              Active
            </button>
            <button 
              onClick={() => filterTasks('completed')} 
              className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg ${filter === 'completed' ? 'bg-gradient-to-r from-purple-500/70 to-pink-500/70 text-white' : ''}`}
            >
              Completed
            </button>
          </div>
        </div>
        
        <ul className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar" onDragOver={handleDragOver}>
          {filteredTasks.length === 0 ? (
            <li className="empty-state">No tasks yet. Add one above!</li>
          ) : (
            filteredTasks.map(task => {
              // Calculate if task is due today or overdue
              let isOverdue = false;
              let isDueToday = false;
              
              if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (dueDate < today) {
                  isOverdue = true;
                } else if (dueDate.getTime() === today.getTime()) {
                  isDueToday = true;
                }
              }
              
              return (
                <li 
                  key={task.id}
                  className={`task-item ${isOverdue ? 'overdue' : ''} ${isDueToday ? 'due-today' : ''} priority-${task.priority} category-${task.category}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className={`task-content ${task.completed ? 'completed' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => toggleComplete(task.id)}
                    />
                    <span className="task-text">{task.text}</span>
                    <div className="task-meta">
                      <span className={`category-badge ${task.category}`}>{task.category}</span>
                      <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                      <span className="due-date">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                    </div>
                  </div>
                  <div className="task-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => {
                        const newText = prompt('Edit task:', task.text);
                        if (newText !== null && newText.trim() !== '') {
                          editTask(task.id, newText);
                        }
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
        
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Drag and drop to reorder tasks</p>
          <button 
            onClick={clearCompleted}
            className="px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
          >
            Clear Completed
          </button>
        </div>
      </div>
      
      <style>
        {`
        .todo-app {
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 4px;
        }
        
        .task-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.7);
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid transparent;
          cursor: grab;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .dark .task-item {
          background: rgba(31, 41, 55, 0.7);
        }
        
        .task-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .task-item.dragging {
          opacity: 0.5;
        }
        
        .priority-high {
          border-left-color: #ef4444;
        }
        
        .priority-medium {
          border-left-color: #f59e0b;
        }
        
        .priority-low {
          border-left-color: #10b981;
        }
        
        .task-content {
          display: flex;
          align-items: center;
          flex: 1;
        }
        
        .task-content.completed .task-text {
          text-decoration: line-through;
          color: #9ca3af;
        }
        
        .task-text {
          margin-left: 10px;
          font-size: 1rem;
        }
        
        .task-meta {
          display: flex;
          margin-left: 20px;
          gap: 8px;
        }
        
        .category-badge, .priority-badge {
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 20px;
        }
        
        .category-personal {
          background-color: rgba(139, 92, 246, 0.2);
          color: #8b5cf6;
        }
        
        .category-work {
          background-color: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }
        
        .category-shopping {
          background-color: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        
        .category-health {
          background-color: rgba(236, 72, 153, 0.2);
          color: #ec4899;
        }
        
        .category-other {
          background-color: rgba(107, 114, 128, 0.2);
          color: #6b7280;
        }
        
        .priority-high {
          background-color: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        
        .priority-medium {
          background-color: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }
        
        .priority-low {
          background-color: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        
        .due-date {
          font-size: 0.7rem;
          color: #6b7280;
        }
        
        .task-actions {
          display: flex;
          gap: 8px;
        }
        
        .task-actions button {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          transition: all 0.2s ease;
        }
        
        .edit-btn {
          background-color: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }
        
        .edit-btn:hover {
          background-color: rgba(59, 130, 246, 0.3);
        }
        
        .delete-btn {
          background-color: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        
        .delete-btn:hover {
          background-color: rgba(239, 68, 68, 0.3);
        }
        
        .alert {
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 15px;
          font-size: 0.9rem;
        }
        
        .alert.success {
          background-color: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        
        .alert.error {
          background-color: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        
        .alert.info {
          background-color: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }
        
        .empty-state {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-style: italic;
        }
        
        .overdue {
          background-color: rgba(239, 68, 68, 0.05);
        }
        
        .due-today {
          background-color: rgba(245, 158, 11, 0.05);
        }
        `}
      </style>
    </div>
  );
};

export default Index;

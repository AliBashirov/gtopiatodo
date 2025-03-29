
import React, { useEffect, useState } from 'react';

const Index = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Load tasks from localStorage when component mounts
    const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    setTasks(savedTasks);
    
    // Set up event listeners for the form
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const categorySelect = document.getElementById('category-select');
    const dueDateInput = document.getElementById('due-date');
    const prioritySelect = document.getElementById('priority-select');
    const filterOptions = document.getElementById('filter-options');
    const clearBtn = document.getElementById('clear-completed');
    
    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (taskInput.value.trim() === '') {
        showAlert('Please enter a task', 'error');
        return;
      }
      
      const newTask = {
        id: Date.now(),
        text: taskInput.value,
        completed: false,
        category: categorySelect.value,
        dueDate: dueDateInput.value,
        priority: prioritySelect.value,
        createdAt: new Date().toISOString()
      };
      
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      
      taskInput.value = '';
      dueDateInput.value = '';
      categorySelect.value = 'personal';
      prioritySelect.value = 'medium';
      
      showAlert('Task added successfully', 'success');
    };
    
    const handleFilterClick = (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      
      document.querySelectorAll('#filter-options button').forEach(btn => {
        btn.classList.remove('active');
      });
      
      e.target.classList.add('active');
      
      setFilter(e.target.dataset.filter);
    };
    
    const handleClearCompleted = () => {
      const updatedTasks = tasks.filter(task => !task.completed);
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      showAlert('Completed tasks cleared', 'info');
    };
    
    if (taskForm) taskForm.addEventListener('submit', handleSubmit);
    if (filterOptions) filterOptions.addEventListener('click', handleFilterClick);
    if (clearBtn) clearBtn.addEventListener('click', handleClearCompleted);
    
    // Cleanup function to remove event listeners
    return () => {
      if (taskForm) taskForm.removeEventListener('submit', handleSubmit);
      if (filterOptions) filterOptions.removeEventListener('click', handleFilterClick);
      if (clearBtn) clearBtn.removeEventListener('click', handleClearCompleted);
    };
  }, [tasks]); // Re-run effect when tasks change
  
  useEffect(() => {
    // Update task display when filter or tasks change
    renderTasks();
  }, [filter, tasks]);
  
  const toggleComplete = (id) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? {...task, completed: !task.completed} : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };
  
  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    showAlert('Task deleted', 'info');
  };
  
  const editTask = (id, newText) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? {...task, text: newText} : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    showAlert('Task updated', 'success');
  };
  
  const showAlert = (message, type) => {
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
  
  const renderTasks = () => {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;
    
    taskList.innerHTML = '';
    
    // Filter tasks based on current filter
    let filteredTasks = [...tasks];
    if (filter === 'active') {
      filteredTasks = tasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
      filteredTasks = tasks.filter(task => task.completed);
    }
    
    if (filteredTasks.length === 0) {
      taskList.innerHTML = '<li class="empty-state">No tasks yet. Add one above!</li>';
      return;
    }
    
    // Sort tasks by priority and date
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      const priorityValues = {high: 3, medium: 2, low: 1};
      return priorityValues[b.priority] - priorityValues[a.priority] || 
            new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    sortedTasks.forEach(task => {
      const taskElement = document.createElement('li');
      taskElement.classList.add('task-item');
      taskElement.dataset.id = task.id;
      
      // Add priority class
      taskElement.classList.add(`priority-${task.priority}`);
      
      // Add category class
      taskElement.classList.add(`category-${task.category}`);
      
      // Check if task is due today or overdue
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
          taskElement.classList.add('overdue');
        } else if (dueDate.getTime() === today.getTime()) {
          taskElement.classList.add('due-today');
        }
      }
      
      const categoryBadge = `<span class="category-badge ${task.category}">${task.category}</span>`;
      const priorityBadge = `<span class="priority-badge ${task.priority}">${task.priority}</span>`;
      const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
      
      taskElement.innerHTML = `
        <div class="task-content ${task.completed ? 'completed' : ''}">
          <input type="checkbox" ${task.completed ? 'checked' : ''}>
          <span class="task-text">${task.text}</span>
          <div class="task-meta">
            ${categoryBadge}
            ${priorityBadge}
            <span class="due-date">${dueDate}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </div>
      `;
      
      // Add event listener for checkbox
      const checkbox = taskElement.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', () => {
        toggleComplete(task.id);
      });
      
      // Add event listener for delete button
      const deleteBtn = taskElement.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => {
        deleteTask(task.id);
      });
      
      // Add event listener for edit button
      const editBtn = taskElement.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => {
        const taskText = taskElement.querySelector('.task-text');
        const currentText = taskText.textContent;
        const newText = prompt('Edit task:', currentText);
        
        if (newText !== null && newText.trim() !== '') {
          editTask(task.id, newText);
        }
      });
      
      taskList.appendChild(taskElement);
    });
    
    // Enable drag and drop
    const taskItems = document.querySelectorAll('.task-item');
    taskItems.forEach(item => {
      item.setAttribute('draggable', true);
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragend', handleDragEnd);
    });
  };
  
  // Drag and drop functionality
  const handleDragStart = function(e) {
    this.classList.add('dragging');
  };

  const handleDragEnd = function() {
    this.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    const taskList = document.getElementById('task-list');
    const draggingItem = document.querySelector('.dragging');
    if (!draggingItem || !taskList) return;
    
    const siblings = [...taskList.querySelectorAll('.task-item:not(.dragging)')];
    const nextSibling = siblings.find(sibling => {
      return e.clientY < sibling.getBoundingClientRect().top + sibling.getBoundingClientRect().height / 2;
    });
    
    taskList.insertBefore(draggingItem, nextSibling);
  };

  // Theme toggle functionality
  const toggleTheme = () => {
    document.body.classList.toggle('dark');
    const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
  };

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
              id="search-input" 
              placeholder="Search tasks..." 
              className="w-full p-3 pl-10 bg-gray-100/70 dark:bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-3.5 text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
        
        <form id="task-form" className="mb-6">
          <div className="mb-4">
            <input 
              type="text" 
              id="task-input" 
              placeholder="What do you need to do?" 
              className="w-full p-3 bg-gray-100/70 dark:bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <select 
                id="category-select" 
                className="w-full p-3 bg-gray-100/70 dark:bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                defaultValue="personal"
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
                id="due-date" 
                className="w-full p-3 bg-gray-100/70 dark:bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            
            <div>
              <select 
                id="priority-select" 
                className="w-full p-3 bg-gray-100/70 dark:bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                defaultValue="medium"
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
          <div id="filter-options" className="flex space-x-2">
            <button data-filter="all" className="active px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">All</button>
            <button data-filter="active" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Active</button>
            <button data-filter="completed" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Completed</button>
          </div>
        </div>
        
        <ul id="task-list" className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar" onDragOver={handleDragOver}></ul>
        
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Drag and drop to reorder tasks</p>
          <button 
            id="clear-completed" 
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
          transition: all 0.2s ease;
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
        
        #filter-options button {
          transition: all 0.3s ease;
        }
        
        #filter-options button.active {
          background: linear-gradient(to right, rgba(139, 92, 246, 0.7), rgba(236, 72, 153, 0.7));
          color: white;
        }
        `}
      </style>
    </div>
  );
};

export default Index;

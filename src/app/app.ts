import { DatePipe, NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [FormsModule, NgClass, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('todo-app');

  newTask: TodoItemModel = new TodoItemModel();

  todoList= signal<TodoItemModel[]> ([]);

  ngOnInit(): void {
    const storedTodoList = localStorage.getItem('todoList');
    if (storedTodoList) {
      this.todoList.set( JSON.parse(storedTodoList));
    }
  }

  generateUniqueId(): void {
    this.newTask.todoItemId =  this.todoList().length + new Date().getDay() + new Date().getMilliseconds() ;
  }

  onSaveNewTask() {
    this.generateUniqueId();

    const objData = structuredClone(this.newTask); // structured clone / detach the reference - 1
    this.todoList.update(old => [...old, objData]);
    localStorage.setItem('todoList', JSON.stringify(this.todoList()));
    this.newTask = new TodoItemModel();
  }

  onEdit(data: TodoItemModel) {
    const strData = JSON.stringify(data); // structured clone / detach the reference - 2
    const objData = JSON.parse(strData);
    this.newTask = objData;
  }

  get isEditing(): boolean {
    return this.newTask.todoItemId !== 0;
  }

  onUpdateTask() {
    const updatedList = this.todoList().map(item => {
      if (item.todoItemId === this.newTask.todoItemId) {
        return this.newTask;
      }
      return item;
    });
    this.todoList.set(updatedList);
    localStorage.setItem('todoList', JSON.stringify(this.todoList()));
    this.newTask = new TodoItemModel();
  }

  onToggleStatus(item: TodoItemModel) {
    this.todoList.update(list =>
      list.map(t =>
        t.todoItemId === item.todoItemId
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      )
    );
    localStorage.setItem('todoList', JSON.stringify(this.todoList()));
  }

  onDelete(todoItemId: TodoItemModel) {
    const updatedList = this.todoList().filter(item => item.todoItemId !== todoItemId.todoItemId);
    this.todoList.set(updatedList);
    localStorage.setItem('todoList', JSON.stringify(this.todoList()));
  }
}

class TodoItemModel {
  todoItem: string;
  createdDate: Date;
  status: string;
  todoItemId: number;


  constructor() {
    this.todoItem = ' ';
    this.createdDate = new Date();
    this.status = 'Pending';
    this.todoItemId = 0;
  }
}

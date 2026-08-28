const form = document.getElementById("todo-form");
const titleInput = document.getElementById("todo-title");
const list = document.getElementById("todo-list");
const count = document.getElementById("todo-count");
const status = document.getElementById("status");
const emptyState = document.getElementById("empty-state");
const template = document.getElementById("todo-template");
let todoItems = [];

function render() {
  list.replaceChildren();
  emptyState.hidden = todoItems.length !== 0;
  count.textContent = `${todoItems.length} ${todoItems.length === 1 ? "todo" : "todos"}`;
  for (const todo of todoItems) {
    const fragment = template.content.cloneNode(true);
    const item = fragment.querySelector("li");
    const toggle = fragment.querySelector(".toggle");
    const editableTitle = fragment.querySelector(".title");
    const saveButton = fragment.querySelector(".save");
    item.classList.toggle("completed", todo.completed);
    toggle.checked = todo.completed;
    editableTitle.value = todo.title;
    toggle.addEventListener("change", () => updateTodo({ ...todo, completed: toggle.checked }));
    saveButton.addEventListener("click", () => updateTodo({ ...todo, title: editableTitle.value }));
    editableTitle.addEventListener("keydown", (event) => {
      if (event.key === "Enter") saveButton.click();
    });
    fragment.querySelector(".delete").addEventListener("click", async () => {
      await runAction(async () => {
        await window.todos.delete(todo.id);
        todoItems = todoItems.filter((itemTodo) => itemTodo.id !== todo.id);
        render();
      }, "Todo deleted.");
    });
    list.append(fragment);
  }
}

async function updateTodo(todo) {
  await runAction(async () => {
    const updated = await window.todos.update(todo);
    todoItems = todoItems.map((item) => item.id === updated.id ? updated : item);
    todoItems.sort((left, right) => Number(left.completed) - Number(right.completed) || right.id - left.id);
    render();
  }, "Todo updated.");
}

async function runAction(action, successMessage) {
  try {
    status.textContent = "";
    await action();
    status.textContent = successMessage;
  } catch (error) {
    status.textContent = error.message;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runAction(async () => {
    todoItems.unshift(await window.todos.create(titleInput.value));
    titleInput.value = "";
    render();
  }, "Todo added.");
});

runAction(async () => {
  todoItems = await window.todos.list();
  render();
}, "Todos loaded.");

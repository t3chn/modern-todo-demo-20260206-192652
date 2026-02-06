(() => {
  const STORAGE_SCOPE = (() => {
    if (typeof location === "undefined") return "root";
    const parts = String(location.pathname || "/")
      .split("/")
      .filter(Boolean);
    return parts[0] || "root";
  })();

  const STORAGE_KEY = `modern-todo-demo:v1:${STORAGE_SCOPE}`;
  const FILTER_KEY = `modern-todo-demo:filter:v1:${STORAGE_SCOPE}`;

  const todoInput = document.getElementById("newTodo");
  const addButton = document.getElementById("addTodo");
  const clearDoneButton = document.getElementById("clearDone");
  const stats = document.getElementById("stats");
  const progressPct = document.getElementById("progressPct");
  const progressRing = document.getElementById("progressRing");
  const list = document.getElementById("todoList");
  const emptyState = document.getElementById("emptyState");
  const filterButtons = Array.from(document.querySelectorAll(".filter"));
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  /** @type {{id: string, text: string, done: boolean, createdAt: number}[]} */
  let todos = [];
  /** @type {"all" | "active" | "done"} */
  let filter = "all";
  /** @type {{type: "add" | "toggle", id: string} | null} */
  let lastAction = null;

  function safeJsonParse(raw, fallback) {
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function isTextEditingTarget(target) {
    if (!target || typeof target !== "object") return false;
    if (target.isContentEditable) return true;

    const tag = target.tagName;
    if (tag === "TEXTAREA") return true;
    if (tag !== "INPUT") return false;

    const type = (target.getAttribute("type") || "text").toLowerCase();
    return !["checkbox", "radio", "button", "submit", "reset"].includes(type);
  }

  function animateIfAllowed(element, keyframes, options) {
    if (reduceMotion) return null;
    if (!element || typeof element.animate !== "function") return null;
    try {
      return element.animate(keyframes, options);
    } catch {
      return null;
    }
  }

  function makeId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function load() {
    const savedTodos = safeJsonParse(localStorage.getItem(STORAGE_KEY) ?? "[]", []);
    if (Array.isArray(savedTodos)) {
      todos = savedTodos
        .filter((t) => t && typeof t === "object")
        .map((t) => ({
          id: typeof t.id === "string" ? t.id : makeId(),
          text: typeof t.text === "string" ? t.text : "",
          done: Boolean(t.done),
          createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
        }))
        .filter((t) => t.text.trim().length > 0);
    }

    const savedFilter = localStorage.getItem(FILTER_KEY);
    if (savedFilter === "all" || savedFilter === "active" || savedFilter === "done") {
      filter = savedFilter;
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    localStorage.setItem(FILTER_KEY, filter);
  }

  function setFilter(next) {
    filter = next;
    for (const button of filterButtons) {
      button.classList.toggle("is-active", button.dataset.filter === next);
    }
    save();
    render();
  }

  function addTodoFromInput() {
    const rawText = todoInput.value ?? "";
    const text = rawText.trim().replace(/\s+/g, " ");
    if (!text) return;

    const id = makeId();
    todos.unshift({
      id,
      text,
      done: false,
      createdAt: Date.now(),
    });
    lastAction = { type: "add", id };
    todoInput.value = "";
    save();
    render();
  }

  function toggleTodo(id, done) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    todo.done = done;
    lastAction = { type: "toggle", id };
    save();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    save();
    render();
  }

  function deleteTodoAnimated(id, element) {
    if (!element || element.dataset.deleting === "1") return;

    const anim = animateIfAllowed(
      element,
      [
        { opacity: 1, transform: "translateX(0) scale(1)" },
        { opacity: 0, transform: "translateX(8px) scale(0.98)" },
      ],
      { duration: 160, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", fill: "forwards" },
    );

    if (!anim) {
      deleteTodo(id);
      return;
    }

    element.dataset.deleting = "1";
    anim.finished.then(() => deleteTodo(id)).catch(() => deleteTodo(id));
  }

  function clearDone() {
    const before = todos.length;
    todos = todos.filter((t) => !t.done);
    if (todos.length === before) return;
    save();
    render();
  }

  function clearDoneAnimated() {
    if (todos.every((t) => !t.done)) return;
    if (reduceMotion) {
      clearDone();
      return;
    }

    const doneElements = Array.from(list.querySelectorAll(".todo.is-done"));
    if (doneElements.length === 0) {
      clearDone();
      return;
    }

    const animations = doneElements
      .map((element, index) =>
        animateIfAllowed(
          element,
          [
            { opacity: 1, transform: "translateY(0) scale(1)" },
            { opacity: 0, transform: "translateY(-6px) scale(0.98)" },
          ],
          {
            duration: 160,
            delay: index * 18,
            easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
            fill: "forwards",
          },
        ),
      )
      .filter(Boolean);

    Promise.all(animations.map((anim) => anim.finished.catch(() => {}))).then(() => clearDone());
  }

  function selectTodos() {
    switch (filter) {
      case "active":
        return todos.filter((t) => !t.done);
      case "done":
        return todos.filter((t) => t.done);
      default:
        return todos;
    }
  }

  function updateStats() {
    const total = todos.length;
    const done = todos.filter((t) => t.done).length;
    const remaining = total - done;

    if (total === 0) {
      stats.textContent = "0 задач";
      if (progressPct) progressPct.textContent = "";
    } else {
      stats.textContent = remaining === 0 ? "Все готово" : `${remaining} осталось`;
      if (progressPct) progressPct.textContent = `${done}/${total}`;
    }

    clearDoneButton.disabled = done === 0;

    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    if (progressRing) {
      progressRing.setAttribute("stroke-dasharray", `${percent} 100`);
    }
  }

  function updateEmptyState(visibleCount) {
    const hasAny = todos.length > 0;
    emptyState.hidden = visibleCount !== 0;

    if (visibleCount !== 0) return;

    const title = emptyState.querySelector(".empty__title");
    const subtitle = emptyState.querySelector(".empty__subtitle");
    if (!title || !subtitle) return;

    if (!hasAny) {
      title.textContent = "Пока пусто";
      subtitle.textContent = "Введите задачу и нажмите Enter.";
      return;
    }

    if (filter === "active") {
      title.textContent = "Нет активных";
      subtitle.textContent = "Все задачи выполнены.";
      return;
    }

    if (filter === "done") {
      title.textContent = "Нет выполненных";
      subtitle.textContent = "Отметьте задачу — и она появится тут.";
      return;
    }

    title.textContent = "Пока пусто";
    subtitle.textContent = "Добавьте новую задачу.";
  }

  function render() {
    const action = lastAction;
    lastAction = null;
    const visibleTodos = selectTodos();
    list.replaceChildren();

    const fragment = document.createDocumentFragment();
    for (const todo of visibleTodos) {
      const li = document.createElement("li");
      li.className = `todo${todo.done ? " is-done" : ""}`;
      li.dataset.todoId = todo.id;

      const label = document.createElement("label");
      label.className = "todo__label";

      const checkbox = document.createElement("input");
      checkbox.className = "todo__checkbox";
      checkbox.type = "checkbox";
      checkbox.checked = todo.done;
      checkbox.addEventListener("change", () => toggleTodo(todo.id, checkbox.checked));

      const text = document.createElement("span");
      text.className = "todo__text";
      text.textContent = todo.text;

      label.append(checkbox, text);

      const del = document.createElement("button");
      del.className = "todo__delete";
      del.type = "button";
      del.title = "Удалить";
      del.setAttribute("aria-label", `Удалить: ${todo.text}`);
      del.innerHTML =
        '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /></svg>';
      del.addEventListener("click", () => deleteTodoAnimated(todo.id, li));

      li.append(label, del);
      fragment.append(li);

      if (action && action.id === todo.id) {
        if (action.type === "add") {
          animateIfAllowed(
            li,
            [
              { opacity: 0, transform: "translateY(-6px) scale(0.99)" },
              { opacity: 1, transform: "translateY(0) scale(1)" },
            ],
            { duration: 180, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" },
          );
        } else if (action.type === "toggle") {
          animateIfAllowed(
            li,
            [
              { transform: "translateY(0) scale(1)" },
              { transform: "translateY(0) scale(0.99)" },
              { transform: "translateY(0) scale(1)" },
            ],
            { duration: 180, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" },
          );
        }
      }
    }

    list.append(fragment);

    updateStats();
    updateEmptyState(visibleTodos.length);
  }

  function bind() {
    addButton.addEventListener("click", addTodoFromInput);
    todoInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addTodoFromInput();
        return;
      }

      if (event.key === "Escape") {
        todoInput.value = "";
        return;
      }
    });

    clearDoneButton.addEventListener("click", clearDoneAnimated);

    for (const button of filterButtons) {
      button.addEventListener("click", () => {
        const next = button.dataset.filter;
        if (next === "all" || next === "active" || next === "done") {
          setFilter(next);
        }
      });
    }

    document.addEventListener("keydown", (event) => {
      const isClear = (event.metaKey || event.ctrlKey) && event.key === "Backspace";
      if (isClear && !event.altKey && !event.shiftKey) {
        if (!isTextEditingTarget(event.target)) {
          event.preventDefault();
          clearDoneAnimated();
        }
        return;
      }

      if (event.key !== "/") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (isTextEditingTarget(event.target)) return;
      if (document.activeElement === todoInput) return;

      event.preventDefault();
      todoInput.focus();
    });
  }

  load();
  bind();
  setFilter(filter);
  render();
})();


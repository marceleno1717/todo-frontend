import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const API_URL = `${API_BASE_URL}/api/todos`;

type TodoFile = {
  id: number;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  url: string;
};

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  files: TodoFile[];
};

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const remainingCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos]
  );

  useEffect(() => {
    void fetchTodos();
  }, []);

  async function fetchTodos(): Promise<void> {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to load todos');
      }
      const data: Todo[] = await response.json();
      setTodos(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    try {
      setError('');
      const formData = new FormData();
      formData.append('title', trimmedTitle);
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create todo');
      }

      const newTodo: Todo = await response.json();
      setTodos((currentTodos) => [newTodo, ...currentTodos]);
      setTitle('');
      setFiles([]);
      form.reset();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to create todo');
    }
  }

  async function toggleTodo(todo: Todo): Promise<void> {
    try {
      setError('');
      const response = await fetch(`${API_URL}/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: todo.title,
          completed: !todo.completed
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      const updatedTodo: Todo = await response.json();
      setTodos((currentTodos) =>
        currentTodos.map((item) => (item.id === updatedTodo.id ? updatedTodo : item))
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to update todo');
    }
  }

  async function deleteTodo(id: number): Promise<void> {
    try {
      setError('');
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to delete todo');
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    setFiles(Array.from(event.target.files || []));
  }

  return (
    <main className="app-shell">
      <section className="todo-card">
        <header className="todo-header">
          <div>
            <p className="eyebrow">Todo App</p>
            <h1>Track work</h1>
          </div>
          <span className="todo-count">{remainingCount} left</span>
        </header>

        <form className="todo-form" onSubmit={handleSubmit}>
          <div className="todo-form-fields">
            <input
              type="text"
              placeholder="Add todo"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <input type="file" multiple onChange={handleFileChange} />
          </div>
          <button type="submit">Add</button>
        </form>

        {error ? <p className="status error">{error}</p> : null}
        {loading ? <p className="status">Loading...</p> : null}

        {!loading && todos.length === 0 ? (
          <p className="status">No todos yet.</p>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className="todo-item">
                <label>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => void toggleTodo(todo)}
                  />
                  <span className={todo.completed ? 'completed' : ''}>{todo.title}</span>
                </label>
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => void deleteTodo(todo.id)}
                >
                  Delete
                </button>
                {todo.files?.length ? (
                  <div className="todo-files">
                    {todo.files.map((file) => (
                      <a
                        key={file.id}
                        href={`${API_BASE_URL}${file.url}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {file.originalName}
                      </a>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;

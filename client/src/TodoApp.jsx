// client/src/TodoApp.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);

  const navigate = useNavigate();

  const fetchTodos = () => {
    fetch('/api/todos')
      .then((res) => {
        if (res.status === 401) {
          navigate('/login');
        }
        return res.json();
      })
      .then((data) => setTodos(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    if (editId) {
      // update
      fetch(`/api/todos/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, completed: false }),
      })
        .then(() => {
          setEditId(null);
          setTitle('');
          setDescription('');
          fetchTodos();
        })
        .catch((err) => console.error(err));
    } else {
      // create
      fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })
        .then(() => {
          setTitle('');
          setDescription('');
          fetchTodos();
        })
        .catch((err) => console.error(err));
    }
  };

  const handleEdit = (todo) => {
    setEditId(todo._id);
    setTitle(todo.title);
    setDescription(todo.description);
  };

  const handleDelete = (id) => {
    fetch(`/api/todos/${id}`, {
      method: 'DELETE',
    })
      .then(() => fetchTodos())
      .catch((err) => console.error(err));
  };

  const handleLogout = () => {
    fetch('/api/auth/logout')
      .then(() => {
        navigate('/login');
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Todo List</h1>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleAddOrUpdate}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              {editId ? 'Update Todo' : 'Add Todo'}
            </button>
            {editId && (
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={() => {
                  setEditId(null);
                  setTitle('');
                  setDescription('');
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>

      {todos.length === 0 ? (
        <p>No todos yet!</p>
      ) : (
        <div className="row">
          {todos.map((todo) => (
            <div key={todo._id} className="col-12 col-md-6 col-lg-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{todo.title}</h5>
                  <p className="card-text">{todo.description}</p>
                </div>
                <div className="card-footer d-flex justify-content-end">
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => handleEdit(todo)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(todo._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

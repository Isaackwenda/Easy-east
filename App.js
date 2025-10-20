import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

const API = process.env.REACT_APP_API_URL;

function App() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const dropRef = useRef();

  useEffect(() => { if (token) fetchFiles(token); }, [token]);

  const login = async () => {
    try {
      const res = await axios.post(`${API}/login`, { username, password });
      setToken(res.data.token);
    } catch { alert("Login failed!"); }
  };

  const fetchFiles = async (authToken) => {
    const res = await axios.get(`${API}/files`, { headers: { Authorization: `Bearer ${authToken}` } });
    setFiles(res.data);
  };

  const uploadFile = async (selectedFile) => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      await axios.post(`${API}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        onUploadProgress: e => setUploadProgress(Math.round((e.loaded * 100) / e.total))
      });
      setUploadProgress(0);
      fetchFiles(token);
    } catch { alert("Upload failed!"); }
  };

  const downloadFile = filename => window.open(`${API}/download/${filename}`, "_blank");

  const handleDrop = e => { e.preventDefault(); const droppedFile = e.dataTransfer.files[0]; setFile(droppedFile); uploadFile(droppedFile); };
  const handleDragOver = e => e.preventDefault();

  return (
    <div className="container">
      {!token ? (
        <div className="login-box">
          <h2>Login</h2>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={login}>Login</button>
        </div>
      ) : (
        <div className="app-box">
          <h2>Upload File</h2>
          <div className="drop-zone" ref={dropRef} onDrop={handleDrop} onDragOver={handleDragOver}>
            {file ? `Ready to upload: ${file.name}` : "Drag & Drop file here or click to select"}
            <input type="file" onChange={e => { setFile(e.target.files[0]); uploadFile(e.target.files[0]); }} />
          </div>
          {uploadProgress > 0 && <div className="progress-bar"><div className="progress" style={{ width: `${uploadProgress}%` }} /></div>}

          <h2>Files</h2>
          <ul className="file-list">
            {files.map(f => (
              <li key={f}>
                {f}
                {/\.(jpg|jpeg|png|gif)$/i.test(f) && <img src={`${API}/download/${f}`} alt={f} className="preview" />}
                <button onClick={() => downloadFile(f)}>Download</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
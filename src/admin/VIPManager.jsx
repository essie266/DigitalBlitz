import React, { useState, useEffect } from "react";
import axios from "axios";

const VIPManager = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [vipLevel, setVipLevel] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("/admin/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error("Error fetching users", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !vipLevel) {
      setMessage("Please select a user and VIP level.");
      return;
    }

    try {
      const res = await axios.post("/admin/update-vip", {
        username: selectedUser,
        vipLevel: parseInt(vipLevel),
      });

      if (res.data.success) {
        setMessage(`VIP level updated for ${selectedUser} to VIP${vipLevel}`);
        setVipLevel("");
        setSelectedUser("");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error updating VIP level.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>VIP Manager</h2>
      <form onSubmit={handleSubmit}>
        <label>User:</label>
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">Select a user</option>
          {users.map(user => (
            <option key={user.username} value={user.username}>
              {user.username}
            </option>
          ))}
        </select>

        <label style={{ marginTop: "10px" }}>VIP Level:</label>
        <input
          type="number"
          value={vipLevel}
          onChange={(e) => setVipLevel(e.target.value)}
          min="0"
        />

        <button type="submit" style={{ marginTop: "10px" }}>Update VIP</button>
      </form>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
};

export default VIPManager;

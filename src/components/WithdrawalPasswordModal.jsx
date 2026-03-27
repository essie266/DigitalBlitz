import React, { useState } from 'react';
import './WithdrawalPasswordModal.css';

const WithdrawalPasswordModal = ({ onSubmit, onClose }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (password.trim()) {
      onSubmit(password);
      setPassword('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <strong data-i18n="Withdrawal Password">Withdrawal Password</strong>
          <span
            className="close-icon"
            onClick={onClose}
            role="button"
            aria-label="Close"
            data-i18n-aria="Close"
          >
            ×
          </span>
        </div>
        <input
          type="password"
          placeholder="Withdrawal Password"
          data-i18n-placeholder="Withdrawal Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="modal-input"
        />
        <button className="modal-submit" onClick={handleSubmit} data-i18n="Submit">
          Submit
        </button>
      </div>
    </div>
  );
};

export default WithdrawalPasswordModal;

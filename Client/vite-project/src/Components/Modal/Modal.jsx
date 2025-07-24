// // Modal.jsx
// import React from "react";
// import styles from "./Modal.module.css";

// function Modal({ onClose, children }) {
//   return (
//     <div className={styles.overlay}>
//       <div className={styles.modal}>
//         <button className={styles.closeButton} onClick={onClose}>
//           &times;
//         </button>
//         {children}
//       </div>
//     </div>
//   );
// }

// export default Modal;


import React from "react";
import styles from "./Modal.module.css";

function Modal({ children, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {children}
        <button className={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default Modal;
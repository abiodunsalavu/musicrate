"use client";

import { useState } from "react";
import EditProfileModal from "./EditProfileModal";

export default function EditProfileButton(props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-primary flex-1"
      >
        Edit profile
      </button>

      {open && <EditProfileModal {...props} onClose={() => setOpen(false)} />}
    </>
  );
}
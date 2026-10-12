"use client";

import { useState } from "react";
import EditProfileModal from "./EditProfileModal";

export default function EditProfileButton(props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="border rounded-lg px-4 py-2 text-sm bg-white text-black font-medium"
      >
        Edit Profile
      </button>

      {open && <EditProfileModal {...props} onClose={() => setOpen(false)} />}
    </>
  );
}
"use client";

import React, { useState, useEffect } from "react";

const Modal = ({ currentImage, setIsModalOpen, setCurrentImage }) => {
  //handle close gambar besar
  const closeModal = () => {
    setIsModalOpen(false); // Tutup modal
    setCurrentImage(""); // Reset gambar saat modal ditutup
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <img
        src={currentImage}
        alt="Gambar Besar"
        className="max-w-3xl max-h-screen rounded shadow-lg"
      />
      <button
        onClick={closeModal}
        className="absolute top-5 right-10 text-red-600 text-5xl"
      >
        &times;
      </button>
    </div>
  );
};

export default Modal;

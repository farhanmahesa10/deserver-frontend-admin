"use client";

import React, { useState, useEffect } from "react";

const Modal = ({ currentImage, setIsModalOpen, setCurrentImage }) => {
  //handle close gambar besar
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImage("");
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="relative w-52 h-52">
        {/* Tombol X menempel di kanan atas gambar */}
        <button
          onClick={closeModal}
          className="absolute -right-6 -top-3 text-red-600 text-4xl font-bold hover:text-red-800"
        >
          &times;
        </button>

        <img
          src={currentImage}
          alt="Gambar Besar"
          className="w-full h-full object-cover rounded shadow-lg"
        />
      </div>
    </div>
  );
};

export default Modal;

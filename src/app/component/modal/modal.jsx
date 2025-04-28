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
      <div className="w-52 h-52">
        <img
          src={currentImage}
          alt="Gambar Besar"
          className="w-full rounded shadow-lg"
        />
      </div>

      <button
        onClick={closeModal}
        className="absolute top-16 right-10 text-red-600 text-5xl"
      >
        &times;
      </button>
    </div>
  );
};

export default Modal;

import React, { useState } from 'react';
import axios from 'axios';

const Homepage = () => {
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageChange = (e) => {
        setSelectedImage(e.target.files[0]);
    };

    const handleUpload = () => {
        if (selectedImage) {
            const formData = new FormData();
            formData.append('image', selectedImage);

            axios
                .post('http://localhost:3001/api/upload', formData)
                .then((response) => {
                    console.log(response.data);
                    alert('Image uploaded successfully!');
                })
                .catch((error) => {
                    console.error('Error:', error);
                    alert('Error uploading image. Please try again.');
                });
        } else {
            alert('Please select an image to upload.');
        }
    };

    return (
        <div className="container mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-4">Image Upload Form</h1>

            <form className="max-w-md">
                <label htmlFor="image" className="block mb-2">
                    Choose an image:
                </label>
                <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mb-4"
                />

                <button
                    type="button"
                    onClick={handleUpload}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Upload Image
                </button>
            </form>
        </div>
    );
};

export default Homepage;

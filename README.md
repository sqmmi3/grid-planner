# Layout Planner 🏗️

**[Live Demo](https://sqmmi3.dev/flux-planner/index.html)** | **[Portfolio](https://sqmmi3.dev)**

A modular 3D spatial layout tool built with **Three.js** and **TypeScript**. This prototype demonstrates the core mechanics required for architectural and office planning software, focusing on spatial intelligence, collision detection, and user interaction.

![Screenshot](./screenshot.ong)

## 🚀 Key Features
* **Grid-Snapping Logic:** Uses Raycasting and mathematical coordinate snapping to ensure all objects perfectly align to a strict 1x1 meter grid.
* **Collision Detection:** Prevents users from placing overlapping objects, ensuring physical constraints are respected.
* **Data-Driven State Management:** Users can seamlessly swap between different module types (Base Cubes, Tall Racks, Flat Rugs) using a centralized data dictionary.
* **Continuous 'Paintbrush' Placement:** Implemented a click-and-drag drawing mechanic for rapid layout generation, alongside separate camera controls (`OrbitControls` mapped to Right-Click).
* **Ghost Preview:** Real-time visual feedback showing a semi-transparent mesh that follows the cursor and turns red if hovering over an invalid/occupied square.

## 🛠️ Tech Stack
* **Core:** Three.js, TypeScript
* **Build Tool:** Vite

## 🧠 Technical Highlights
* **Memory Management:** Implemented strict garbage collection protocols. When an object is deleted (Shift + Left Click), the application actively calls `.dispose()` on both the geometry and material to prevent WebGL memory leaks.
* **Custom Event Handling:** Overrode default OrbitControls and browser context menus to create a seamless, professional UX (Left-Click to build, Right-Click to pan, Shift-Click to delete).

## 💻 Local Setup
```bash
npm install
npm run dev

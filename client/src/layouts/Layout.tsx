import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import SideBar from "@/components/SideBar";

function Layout() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111827",
            color: "#fff",
            border: "1px solid #32435e",
          },
        }}
      />

      <SideBar />

      <main className="mt-10 mx-auto max-w-6xl p-10 bg-oscuro-secundario rounded-lg shadow-sm">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;

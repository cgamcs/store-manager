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

      <div className="flex bg-oscuro-primario">
        <SideBar />

        <main className="mt-2 mr-2 mb-2 w-full py-6 px-5 bg-oscuro-secundario rounded-2xl shadow-2xl">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default Layout;

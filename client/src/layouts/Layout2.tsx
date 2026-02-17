import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import SideBar2 from "@/components/SideBar2";

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
        <SideBar2 />

        <main className="mx-auto w-full m-2 py-6 px-5 bg-oscuro-secundario rounded-2xl shadow-2xl">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default Layout;

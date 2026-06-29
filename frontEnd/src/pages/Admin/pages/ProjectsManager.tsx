import { useState } from "react";
import {
  ShoppingBag, Package, CalendarDays, Tag, UserCircle, BarChart3, Image, Bell, LayoutGrid
} from "lucide-react";
import ProductsPanel from "./ProductsPanel";
import OrdersPanel from "./ordersmanager";
import HireRequestsPanel from "./hirerequestsmanager";
import CategoriesPanel from "./CategoryManager";
import CustomersPanel from "./CustomerManager";
import ReportsPanel from "./Reports";
import SliderManager from "./SliderManager";
import CategoryCardManager from "./CategoryCardManager";
import NotificationsPanel from "./NotificationsPanel";

const tabs = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "products",      label: "Products",      icon: ShoppingBag },
  { id: "orders",        label: "Orders",        icon: Package },
  { id: "hire",          label: "Hire Requests", icon: CalendarDays },
  { id: "categories",    label: "Categories",    icon: Tag },
  { id: "customers",     label: "Customers",     icon: UserCircle },
  { id: "cards",         label: "Home Cards",    icon: LayoutGrid },
  { id: "sliders",       label: "Slider Images", icon: Image },
  { id: "reports",       label: "Reports",       icon: BarChart3 },
] as const;

type TabId = typeof tabs[number]["id"];

export default function ProjectsManager() {
  const [activeTab, setActiveTab] = useState<TabId>("notifications");

  return (
    <div>
      {/* Tab Bar */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-slate-200 pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "notifications" && <NotificationsPanel />}
      {activeTab === "products" && <ProductsPanel />}
      {activeTab === "orders" && <OrdersPanel />}
      {activeTab === "hire" && <HireRequestsPanel />}
      {activeTab === "categories" && <CategoriesPanel />}
      {activeTab === "customers" && <CustomersPanel />}
      {activeTab === "cards" && <CategoryCardManager />}
      {activeTab === "sliders" && <SliderManager />}
      {activeTab === "reports" && <ReportsPanel />}
    </div>
  );
}

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { assertRestaurantOwner } from "@/lib/auth";

export default async function RestaurantPortalLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const user = await assertRestaurantOwner(id);
    if (!user) redirect("/restaurant");
    return <>{children}</>;
}

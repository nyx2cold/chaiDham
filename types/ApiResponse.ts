import { Order } from "@/model/order";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingOrders?: boolean;   
  orders?: Array<Order>;         
  role?: "admin" | "user";       
}
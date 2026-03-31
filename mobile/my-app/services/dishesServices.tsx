import { DishType } from "@/type/dishes.type"
import { API_BASE_URL, fixImageUrl, fetchWithTimeout } from "@/constants/api"

// Interface cho featured dish response từ API
interface FeaturedDishResponse {
    id?: string;
    title?: string;
    description?: string;
    price?: number;
    cooking_method?: string;
    rating?: number;
    img?: string;
}

// Lấy tất cả món ăn
export const getDishes = async (): Promise<DishType[]> => {
    try {
        const url = `${API_BASE_URL}/api/dishes`

        if (__DEV__) {
            console.log('Fetching dishes from:', url)
        }

        const response = await fetchWithTimeout(url)

        if (!response.ok) {
            console.error('Response not OK:', response.status, response.statusText)
            return []
        }

        const data = await response.json()

        if (data?.data?.dishes && Array.isArray(data.data.dishes)) {
            return data.data.dishes.map((dish: DishType) => ({
                ...dish,
                image_url: fixImageUrl(dish.image_url)
            }))
        }

        return []
    } catch (error) {
        console.error('Error fetching dishes:', error)
        // Return empty array thay vì throw để UI không crash
        return []
    }
}

// Lấy món ăn nổi bật (hot)
export const getFeaturedDishes = async (): Promise<DishType[]> => {
    try {
        const url = `${API_BASE_URL}/api/dishes/featured`

        if (__DEV__) {
            console.log('Fetching featured dishes from:', url)
        }

        const response = await fetchWithTimeout(url)

        if (!response.ok) {
            console.error('Response not OK:', response.status, response.statusText)
            return []
        }

        const data = await response.json()

        // API trả về mảng DishCardResponse, cần map về DishType
        if (Array.isArray(data)) {
            return data.map((item: FeaturedDishResponse) => ({
                // Sử dụng id từ API nếu có, nếu không tạo từ title
                id: item.id || `featured-${item.title || 'unknown'}`,
                name: item.title || '',
                description: item.description || '',
                price: item.price || 0,
                category: '',
                cooking_method: item.cooking_method || '',
                is_popular: true,
                rating: item.rating || 0,
                image_url: fixImageUrl(item.img || ''),
                created_at: '',
                updated_at: '',
            }))
        }

        return []
    } catch (error) {
        console.error('Error fetching featured dishes:', error)
        return []
    }
}
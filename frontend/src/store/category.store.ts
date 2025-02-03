import {defineStore} from "pinia";
import {ref} from "vue";
import axios from "axios";

export interface Category {
    id: string,
    name: string
}

export const useCategoryStore = defineStore('category', () => {
    const categories = ref<Category[]>([])

    async function fetchCategories() {
        try {
            const response = await axios.get("/category")
            categories.value = response.data
        } catch (error) {
            console.error("failed to fetch categoreis", error)
        }
    }

    return {categories, fetchCategories}
})
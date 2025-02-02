import {array, boolean, number, object, string, TypeOf} from "zod"

export const createPostSchema = object({
    body: object({
        title: string({
            required_error: "Title is required",
        }).min(3, "Title too short - should be at least 3 characters long"),
        description: string({
            required_error: "Description is required",
        }).min(1, "Description too short - should be at least 1 character long"),
        categories: array(string({
            required_error: "Category is required",
        })).nonempty("At least one category is required"),
        isPublic: boolean({
            required_error: "isPublic is required",
        }),
        location: object({
            latitude: number({
                required_error: "Latitude is required",
            })
                .min(-90, "Latitude must be between -90 and 90")
                .max(90, "Latitude must be between -90 and 90"),

            longitude: number({
                required_error: "Longitude is required",
            })
                .min(-180, "Longitude must be between -180 and 180")
                .max(180, "Longitude must be between -180 and 180"),
        })
            .refine(
                (loc) => loc.latitude >= -90 && loc.latitude <= 90 && loc.longitude >= -180 && loc.longitude <= 180,
                {
                    message: "Invalid location coordinates",
                }
            ),
    }).strict(),
})

export const updatePostSchema = object({
    body: object({
        title: string({
            required_error: "Title is required",
        }).min(3, "Title too short - should be at least 3 characters long"),
        description: string({
            required_error: "Description is required",
        }).min(1, "Description too short - should be at least 1 character long"),
        categories: array(string({
            required_error: "Category is required",
        })).nonempty("At least one category is required"),
        isPublic: boolean({
            required_error: "isPublic is required",
        }),
        location: object({
            latitude: number({
                required_error: "Latitude is required",
            })
                .min(-90, "Latitude must be between -90 and 90")
                .max(90, "Latitude must be between -90 and 90"),

            longitude: number({
                required_error: "Longitude is required",
            })
                .min(-180, "Longitude must be between -180 and 180")
                .max(180, "Longitude must be between -180 and 180"),
        })
            .refine(
                (loc) => loc.latitude >= -90 && loc.latitude <= 90 && loc.longitude >= -180 && loc.longitude <= 180,
                {
                    message: "Invalid location coordinates",
                }
            ),
    }).strict(),
    params: object({
        postId: string({
            required_error: "postId is required",
        }),
    }).strict(),
})

export type CreatePostInput = TypeOf<typeof createPostSchema>
export type UpdatePostInput = TypeOf<typeof updatePostSchema>
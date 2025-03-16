import { randomUUID } from "node:crypto"



export class databaseMemory {
    #videos = new Map() 
    
    //? CRUD

    // CREATE
    create(video) {
        const videoID = randomUUID();

        this.#videos.set(videoID, video);
    }

    // READ
    list(search) {
        return Array.from(this.#videos.entries()).map(
            (video) => {
                const ID = video[0];
                const data = video[1];


                return {
                    ID,
                    ...data
                }
            }
        )
        .filter((video) => {
            if (search) {
                return video.title.includes(search)
            }

            return true;
        })
    }

    // UPDATE
    update(id, video) {
        this.#videos.set(id, video);
    }

    // DELETE
    delete(id) {
        this.#videos.delete(id);
    }
}   
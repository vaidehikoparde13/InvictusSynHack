// src/services/mockAPI.js
export const workerAPI = {
  getTasks: async (params = {}) => {
    console.log("Mock API: getTasks called with params", params)

    // simulate delay
    await new Promise((res) => setTimeout(res, 600))

    const dummyTasks = [
      {
        id: 1,
        title: "Fix Street Light",
        category: "Electrical",
        status: "Assigned",
        priority: "High",
        assigned_at: "2025-11-01T09:00:00Z",
        created_at: "2025-10-31T14:00:00Z",
      },
      {
        id: 2,
        title: "Repair Water Leak",
        category: "Plumbing",
        status: "In Progress",
        priority: "Medium",
        assigned_at: "2025-11-02T10:00:00Z",
        created_at: "2025-11-01T12:00:00Z",
      },
      {
        id: 3,
        title: "Paint Community Hall",
        category: "Maintenance",
        status: "Completed",
        priority: "Low",
        assigned_at: "2025-11-03T08:30:00Z",
        created_at: "2025-11-02T11:00:00Z",
      },
    ]

    const pending = dummyTasks.filter(
      (t) => t.status === "Assigned" || t.status === "In Progress"
    )
    const completed = dummyTasks.filter((t) => t.status === "Completed")

    // return structure similar to your real backend
    return {
      data: {
        data: {
          all: dummyTasks,
          pending,
          completed,
        },
      },
    }
  },

  getTask: async (id) => {
    console.log("Mock API: getTask called with id", id)
    await new Promise((res) => setTimeout(res, 400))

    const dummyTask = {
      id,
      title: "Fix Street Light",
      category: "Electrical",
      subcategory: "Outdoor Lights",
      status: "In Progress",
      priority: "High",
      description: "The street light outside Block A is not working. Needs bulb replacement.",
      assigned_at: "2025-11-01T09:00:00Z",
      created_at: "2025-10-31T14:00:00Z",
      resident_name: "Rohit Sharma",
      floor: "2nd",
      room: "A-201",
      attachments: [
        {
          filename: "photo1.jpg",
          file_path: "/uploads/photo1.jpg",
        },
      ],
      proof_of_work: [
        {
          filename: "fixed_light.jpg",
          file_path: "/uploads/fixed_light.jpg",
        },
      ],
      comments: [
        {
          full_name: "Rohit Sharma",
          comment: "Please fix this ASAP.",
          created_at: "2025-11-01T09:15:00Z",
        },
        {
          full_name: "Maintenance Team",
          comment: "Assigned to worker Rajesh.",
          created_at: "2025-11-01T10:00:00Z",
        },
      ],
    }

    return { data: { data: dummyTask } }
  },

  updateTaskStatus: async (id, status, resolution) => {
    console.log("Mock API: updateTaskStatus called", { id, status, resolution })
    await new Promise((res) => setTimeout(res, 500))
    // Always success
    return { data: { message: "Status updated (mock)" } }
  },

  uploadProof: async (id, files) => {
    console.log("Mock API: uploadProof called", { id, files })
    await new Promise((res) => setTimeout(res, 800))
    return { data: { message: "Proof uploaded (mock)" } }
  },
}


export class Task {
    constructor(properties, config) {
        this.title = properties.title;
        this.description = properties.description || "";
        this.collection = properties.collection || config.defaultCollection || "New Tasks";
        this.priority = properties.priority || config.defaultPriority || "Normal";
        this.status = properties.status || config.defaultStatus || "To Do";
        this.createdAt = new Date();
    }

    toMarkdown() {
        // Future expansion: visual indicators for priority/status can be added here
        // For now, adhere to standard format
        let md = `- [ ] **${this.title}**`;
        if (this.description) {
            md += `\n    - ${this.description}`;
        }
        if (this.collection) {
            md += `\n    - Collection: ${this.collection}`;
        }
        if (this.priority) {
            md += `\n    - Priority: ${this.priority}`;
        }
        if (this.status) {
            md += `\n    - Status: ${this.status}`;
        }
        if (this.createdAt) {
            md += `\n    - Created: ${this.createdAt.toLocaleString()}`;
        }
        return md;
    }
}
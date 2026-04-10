# Backend entry point
import os

import uvicorn


if __name__ == "__main__":
    reload_enabled = os.getenv("RELOAD")
    if reload_enabled is None:
        reload_enabled = os.getenv("ENVIRONMENT", "development").lower() == "development"
    else:
        reload_enabled = reload_enabled.lower() in {"1", "true", "yes", "on"}

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=reload_enabled,
    )

from typing import Any
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse


class ResponseModel:
    """统一响应格式"""

    @staticmethod
    def json(data: Any = None, message: str = "ok", code: int = 0, status_code: int | None = None) -> JSONResponse:
        final_status = status_code if status_code is not None else (200 if code == 0 else code)
        return JSONResponse(
            status_code=final_status,
            content={
                "code": code,
                "data": jsonable_encoder(data),
                "message": message,
            },
        )

    @staticmethod
    def success(data: Any = None, message: str = "ok") -> JSONResponse:
        return ResponseModel.json(data=data, message=message, code=0, status_code=200)

    @staticmethod
    def error(code: int = 400, message: str = "Error", data: Any = None) -> JSONResponse:
        return ResponseModel.json(data=data, message=message, code=code, status_code=code)


def resp(data: Any = None, message: str = "ok", code: int = 0, status_code: int | None = None) -> JSONResponse:
    return ResponseModel.json(data=data, message=message, code=code, status_code=status_code)


def error_resp(code: int = 400, message: str = "Error", data: Any = None) -> JSONResponse:
    return ResponseModel.error(code=code, message=message, data=data)

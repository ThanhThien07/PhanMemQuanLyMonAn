/**
 * Phản hồi thành công chuẩn hóa
 */
export function successResponse(res, data = null, message = 'Thành công', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data: data !== null ? data : undefined,
    ...(typeof data === 'object' && !Array.isArray(data) && data !== null ? data : {})
  });
}

/**
 * Phản hồi lỗi chuẩn hóa
 */
export function errorResponse(res, message = 'Đã có lỗi xảy ra', statusCode = 500, errors = null) {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errors || undefined
  });
}

export default {
  successResponse,
  errorResponse
};

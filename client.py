import socket
import time

def start_udp_client(data_size):
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    server_address = ('192.168.0.104', 65432)  # 서버 IP 주소와 포트 설정

    # 요청 메시지 전송
    request = f"GET {data_size}"
    client_socket.sendto(request.encode(), server_address)

    total_received = 0
    start_time = time.time()  # 데이터 수신 시작 시간 기록

    while total_received < data_size:
        chunk, _ = client_socket.recvfrom(65507)  # 최대 65,507바이트 수신
        total_received += len(chunk)

    end_time = time.time()  # 데이터 수신 완료 시간 기록
    elapsed_time = end_time - start_time  # 전송에 걸린 시간 계산

    print(f"받은 데이터 크기: {total_received} 바이트")
    print(f"전송 시간: {elapsed_time:.6f} 초")

    client_socket.close()

if __name__ == "__main__":
    start_udp_client(10000000)  # 10만 바이트 요청

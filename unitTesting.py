import requests
import json

USE_LOCAL = False  # True for LOCAL Server, False for Online Render Server

# Define API endpoints
BASE_URL = "http://localhost:3000" if USE_LOCAL else "https://serverside-project-csrh.onrender.com"


def get_filename():
    return input("Enter the filename to save test results: ")


def write_result(file_name_input, test_name, response):
    try:
        response_json = json.dumps(response.json(), indent=4)
    except json.JSONDecodeError:
        response_json = response.text

    result = f"\n===== {test_name} =====\n" \
             f"Status Code: {response.status_code}\n" \
             f"Response:\n{response_json}\n" \
             f"==============================\n"

    with open(file_name_input, "a") as f:
        f.write(result)


def test_get_developer_team_members(file_name_input):
    url = f"{BASE_URL}/api/about"
    try:
        response = requests.get(url, timeout=5)
        write_result(file_name_input, "test_get_team_members", response)
    except requests.exceptions.RequestException as e:
        with open(file_name_input, "a") as f:
            f.write(f"\n===== test_get_team_members =====\nRequest Failed: {e}\n==============================\n")


def test_get_user_details(file_name_input):
    url = f"{BASE_URL}/api/users/123123"
    try:
        response = requests.get(url, timeout=5)
        write_result(file_name_input, "test_get_user_details", response)
    except requests.exceptions.RequestException as e:
        with open(file_name_input, "a") as f:
            f.write(f"\n===== test_get_user_details =====\nRequest Failed: {e}\n==============================\n")


def test_add_cost_item(file_name_input):
    url = f"{BASE_URL}/api/add"
    payload = {
        "description": "Laptop",
        "category": "education",
        "userid": 123123,
        "sum": 3000
    }
    try:
        response = requests.post(url, json=payload, timeout=5)
        write_result(file_name_input, "test_add_cost", response)
    except requests.exceptions.RequestException as e:
        with open(file_name, "a") as f:
            f.write(f"\n===== test_add_cost =====\nRequest Failed: {e}\n==============================\n")


def test_get_report(file_name_input):
    url = f"{BASE_URL}/api/report?id=123123&year=2025&month=2"
    try:
        response = requests.get(url, timeout=5)
        write_result(file_name_input, "test_get_monthly_report", response)
    except requests.exceptions.RequestException as e:
        with open(file_name, "a") as f:
            f.write(f"\n===== test_get_monthly_report =====\nRequest Failed: {e}\n==============================\n")


if __name__ == "__main__":
    file_name = get_filename()
    with open(file_name, "w") as file:
        file.write("===== API Test Results =====\n")

    test_get_developer_team_members(file_name)
    test_get_user_details(file_name)
    test_add_cost_item(file_name)
    test_get_report(file_name)

    print(f"All test results saved in {file_name}")

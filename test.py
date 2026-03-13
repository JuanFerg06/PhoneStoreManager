from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

# Iniciar el navegador
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
driver.get("http://localhost:3000")  # URL de tu app en desarrollo

wait = WebDriverWait(driver, 10)

# ============================
# TEST 1: Login
# ============================
print("--- Test Login ---")

# Esperar que cargue el formulario
usuario_input = wait.until(EC.presence_of_element_located((By.ID, "username")))
password_input = driver.find_element(By.ID, "password")

# Ingresar credenciales
usuario_input.send_keys("admin")
password_input.send_keys("admin123")

# Click en el boton de login
login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
login_btn.click()

# Verificar que estamos en el dashboard
time.sleep(1)
assert "Dashboard" in driver.page_source or "Panel" in driver.page_source
print("Login exitoso ✓")

# ============================
# TEST 2: Navegar al Inventario
# ============================
print("--- Test Navegacion Inventario ---")

inventario_link = wait.until(
    EC.element_to_be_clickable((By.XPATH, "//span[contains(text(),'Inventario')]"))
)
inventario_link.click()
time.sleep(1)

assert "Inventario" in driver.page_source
print("Navegacion a Inventario exitosa ✓")

# ============================
# TEST 3: Agregar un producto
# ============================
print("--- Test Agregar Producto ---")

agregar_btn = wait.until(
    EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Agregar')]"))
)
agregar_btn.click()
time.sleep(0.5)

# Llenar el formulario del dialog
marca_input = wait.until(EC.presence_of_element_located((By.ID, "brand")))
marca_input.clear()
marca_input.send_keys("Xiaomi")

modelo_input = driver.find_element(By.ID, "model")
modelo_input.clear()
modelo_input.send_keys("Redmi Note 13")

precio_input = driver.find_element(By.ID, "price")
precio_input.clear()
precio_input.send_keys("4500")

cantidad_input = driver.find_element(By.ID, "quantity")
cantidad_input.clear()
cantidad_input.send_keys("20")

# Guardar
guardar_btn = driver.find_element(By.XPATH, "//button[contains(text(),'Agregar')]")
guardar_btn = wait.until(
    EC.element_to_be_clickable((By.XPATH, "//div[@role='dialog']//button[contains(text(),'Agregar')]"))
)
guardar_btn.click()

assert "Xiaomi" in driver.page_source
print("Producto agregado exitosamente ✓")

# ============================
# TEST 4: Navegar a Ventas
# ============================
print("--- Test Navegacion Ventas ---")

ventas_link = wait.until(
    EC.element_to_be_clickable((By.XPATH, "//span[contains(text(),'Ventas')]"))
)
ventas_link.click()
time.sleep(1)

assert "Ventas" in driver.page_source
print("Navegacion a Ventas exitosa ✓")

# ============================
# TEST 5: Login fallido
# ============================
print("--- Test Login Fallido ---")

# Primero cerrar sesion desde el sidebar
try:
    logout_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//span[contains(text(),'Cerrar Sesion')]/parent::button"))
    )
    logout_btn.click()
    time.sleep(1)
except:
    # Si no encuentra el boton, limpiar localStorage manualmente
    driver.execute_script("localStorage.clear()")
    driver.get("http://localhost:3000")
    time.sleep(1)

# Ahora deberiamos estar en el login
usuario_input = wait.until(EC.presence_of_element_located((By.ID, "username")))
password_input = driver.find_element(By.ID, "password")

usuario_input.send_keys("admin")
password_input.send_keys("clave_incorrecta")

login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
login_btn.click()
time.sleep(1)

# Verificar que se muestra error
assert "incorrect" in driver.page_source.lower() or "error" in driver.page_source.lower() or "incorrecto" in driver.page_source.lower()
print("Login fallido detectado correctamente ✓")
# ============================
# Cerrar navegador
# ============================
print("\n=== Todas las pruebas pasaron ===")
driver.quit()
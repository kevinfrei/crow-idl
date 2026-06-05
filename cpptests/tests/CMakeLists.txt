enable_testing()
include(GoogleTest)

add_executable(idl_testing json_test.cpp)
target_include_directories(idl_testing PRIVATE .. ../../build)
target_link_libraries(idl_testing PUBLIC ${CROW_LIB} ${GTEST_LIB})
gtest_discover_tests(idl_testing)

add_executable(js_cpp_xproc xproc_test.cpp)
target_include_directories(js_cpp_xproc PRIVATE .. ../../build)
target_link_libraries(js_cpp_xproc PUBLIC ${CROW_LIB})

add_executable(idl_module_testing)
target_sources(idl_module_testing PRIVATE json_test_module.cpp)
target_sources(
  idl_module_testing
  PRIVATE
  FILE_SET
  CXX_MODULES
  FILES
    gen.cppm common.cppm
)
target_link_libraries(idl_module_testing PUBLIC ${CROW_LIB} ${GTEST_LIB})
gtest_discover_tests(idl_module_testing)

add_executable(js_cpp_xproc_module)
target_sources(js_cpp_xproc_module PRIVATE xproc_test_module.cpp)
target_sources(
  js_cpp_xproc_module
  PRIVATE
  FILE_SET
  CXX_MODULES
  FILES
    gen.cppm common.cppm
)
target_link_libraries(js_cpp_xproc_module PUBLIC ${CROW_LIB})

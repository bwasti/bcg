cmake_minimum_required(VERSION 3.24)
project(bcg)

add_library(bcg SHARED bcg.cpp)
set_property(TARGET bcg PROPERTY CXX_STANDARD 20)
set_target_properties(
  bcg
  PROPERTIES
  LIBRARY_OUTPUT_DIRECTORY ${PROJECT_SOURCE_DIR}
)

add_subdirectory(libsysml/cpp/)
target_link_libraries(bcg sysmlcpp)

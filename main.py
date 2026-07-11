import tkinter as tk


class CalculatorApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Calculadora")
        self.root.resizable(False, False)

        self.expression = ""
        self.display_var = tk.StringVar(value="0")

        self._build_ui()

    def _build_ui(self) -> None:
        display = tk.Entry(
            self.root,
            textvariable=self.display_var,
            font=("Arial", 20),
            justify="right",
            bd=10,
            relief=tk.GROOVE,
            width=16,
        )
        display.grid(row=0, column=0, columnspan=4, padx=10, pady=10)

        buttons = [
            ("C", 1, 0),
            ("(", 1, 1),
            (")", 1, 2),
            ("/", 1, 3),
            ("7", 2, 0),
            ("8", 2, 1),
            ("9", 2, 2),
            ("*", 2, 3),
            ("4", 3, 0),
            ("5", 3, 1),
            ("6", 3, 2),
            ("-", 3, 3),
            ("1", 4, 0),
            ("2", 4, 1),
            ("3", 4, 2),
            ("+", 4, 3),
            ("0", 5, 0),
            (".", 5, 1),
            ("=", 5, 2),
            ("⌫", 5, 3),
        ]

        for text, row, column in buttons:
            tk.Button(
                self.root,
                text=text,
                font=("Arial", 16),
                width=5,
                height=2,
                command=lambda value=text: self.on_button_click(value),
            ).grid(row=row, column=column, padx=5, pady=5)

    def on_button_click(self, value: str) -> None:
        if value == "C":
            self.expression = ""
            self.display_var.set("0")
            return

        if value == "⌫":
            self.expression = self.expression[:-1]
            self.display_var.set(self.expression or "0")
            return

        if value == "=":
            self._calculate_result()
            return

        if self.display_var.get() == "Erro":
            self.expression = ""

        self.expression += value
        self.display_var.set(self.expression)

    def _calculate_result(self) -> None:
        try:
            result = eval(self.expression, {"__builtins__": {}}, {})
            self.expression = str(result)
            self.display_var.set(self.expression)
        except Exception:
            self.expression = ""
            self.display_var.set("Erro")


def main() -> None:
    root = tk.Tk()
    CalculatorApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
